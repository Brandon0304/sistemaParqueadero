package com.parqueadero.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "configuracion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Configuracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private Vehiculo.TipoVehiculo tipoVehiculo;

    @Column(nullable = false)
    private Integer capacidadTotal;

    @Column(nullable = false)
    private Boolean activa = true;
}
