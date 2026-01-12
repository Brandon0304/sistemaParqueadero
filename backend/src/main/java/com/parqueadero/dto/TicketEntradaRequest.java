package com.parqueadero.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketEntradaRequest {

    // ID del vehículo si ya existe
    private Long vehiculoId;

    // Datos para crear vehículo inline si no existe
    private String placa;
    private String tipo;
    private String marca;
    private String modelo;
    private String color;

    private String observaciones;
}
