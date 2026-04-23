sequenceDiagram
    autonumber
    actor ACTOR as SchedulerTrigger
    participant SS as SchedulingService
    participant RB as AiRequestBuilder
    participant AC as AiServerClient
    participant API as AI Scheduling API
    participant DP as DataPreprocessor
    participant FE as ForecastingEngine
    participant RL as RLInferenceEngine
    participant AB as AiResponseBuilder

    Note over RB: [AiRequestData]<br/>- request_id: String<br/>- timestamp: String<br/>- cluster_state (time_index, day_of_week, tou_price, grid_limit, transfer_enabled)<br/>- stations (station_id, current_state, constraints)<br/>-- current_state (demand_count, chargers, power, soc)<br/>-- constraints (soc_min, soc_max, ess_max_charge, ess_max_discharge)

    ACTOR->>+SS: runScheduling()

    SS->>+RB: buildAiRequest()

    RB->>RB: buildClusterState()
    RB->>RB: buildStations()

    loop station_id = 0..4
        RB->>RB: toStationDto(station)
        RB->>RB: calculateDemandCount(station)
        RB->>RB: buildChargers(station)
        RB->>RB: buildPower(station)
    end

    RB-->>-SS: requestDto: AiRequestData

    SS->>+AC: requestSchedule(requestDto)

    AC->>+API: POST /schedule(requestDto)

    API->>+DP: normalizeInputData(requestDto)

    Note right of DP: [입력 검증 + 전처리]<br/>- station_count_check == 5<br/>- charger_count_check == 5 / station<br/>- charger_id, type, power_demand, is_active 누락 검증<br/>- soc_range_check: 0.1 <= soc <= 0.9<br/>- 수치형 형식 검증<br/>- min-max normalization 수행

    DP-->>-API: normData: NormalizedInputData

    alt 입력 검증 실패
        API->>API: 오류 응답 생성
        API-->>-AC: errorResponseJson

        AC-->>-SS: failedDto: AiResponseData

        SS->>SS: saveAiResult(failedDto)
        Note right of SS: 실패 이력 저장<br/>- request_id, timestamp, error_code, message

        SS-->>-ACTOR: scheduling failed

    else 입력 검증 성공
        API->>+FE: predictPvGeneration(normData)
        FE-->>-API: pvForecast: PvForecastData

        API->>+FE: predictChargingLoad(requestDto)
        Note right of FE: 내부적으로 chargers[*]에서<br/>active_charger_count, charger_demand_vector_5,<br/>charger_type_vector를 구성하여 load 예측 수행
        FE-->>-API: loadForecast: LoadForecastData

        API->>+DP: buildRLInputStateVector(normData, pvForecast, loadForecast)
        DP-->>-API: rlStateVector: float[]

        API->>+DP: encodeTopologyTensor(transferTopologyData)
        DP-->>-API: topologyTensor: float[][]

        API->>+RL: runSacPolicyInference(rlStateVector, topologyTensor)
        RL-->>API: rawAction: RawActionOutput

        Note right of RL: [강화학습 출력]<br/>- ess_power_ratio_schedule_by_station<br/>- pv_priority_schedule_by_station<br/>- transfer_power_ratio_schedule_by_time

        API->>RL: applyConstraintCorrection(rawAction, constraintsList)
        Note right of RL: [제약조건 보정]<br/>- soc_min / soc_max<br/>- ess_max_charge / ess_max_discharge<br/>- grid_limit, transfer capacity<br/>- inactive_station_masking<br/>- clipping / scaling

        RL-->>-API: scaledAction: ScaledActionOutput

        API->>+AB: assembleClusterSchedule(scaledAction)

        loop station_id = 0..4
            loop hour = 0..23
                AB->>AB: hourly_plan[hour] 매핑
            end
        end

        AB-->>API: clusterSched: AssembledClusterSchedule

        API->>AB: buildAiResponse(request_id, timestamp, clusterSched)
        AB->>AB: buildStatusBlock()
        AB->>AB: buildStationDayAheadSchedule()
        AB-->>API: responseDto: AiResponseData

        API->>AB: serializeResponseJson(responseDto)
        AB-->>-API: responseJson: String

        Note over AB: [AiResponseData]<br/>- request_id, timestamp<br/>- status (is_success, error_code, message)<br/>- station_day_ahead_schedule (station_id, hourly_plan)

        API-->>-AC: 200 OK + responseJson

        AC-->>-SS: aiResponseDto: AiResponseData

        SS->>SS: saveAiResult(aiResponseDto)
        Note right of SS: 저장 대상 예시<br/>- schedule_target_date, station_id, hourly_plan, status

        SS-->>-ACTOR: scheduling completed
    end