package com.parqueadero.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EspaciosResponse {

    private Map<String, EspacioDetalle> espacios;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EspacioDetalle {
        private Integer total;
        private Integer ocupados;
        private Integer disponibles;
        private Double porcentajeOcupacion;
    }
}
