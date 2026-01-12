package com.parqueadero.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehiculoRequest {

    @NotBlank(message = "La placa es obligatoria")
    @Size(max = 10, message = "La placa no puede exceder 10 caracteres")
    private String placa;

    @NotNull(message = "El tipo de vehículo es obligatorio")
    private String tipo;

    @Size(max = 50, message = "La marca no puede exceder 50 caracteres")
    private String marca;

    @Size(max = 50, message = "El modelo no puede exceder 50 caracteres")
    private String modelo;

    @Size(max = 20, message = "El color no puede exceder 20 caracteres")
    private String color;
}
