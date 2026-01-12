package com.parqueadero.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tarifas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Tarifa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 20)
    private Vehiculo.TipoVehiculo tipoVehiculo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tarifaHora;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tarifaDia;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tarifaMinutoAdicional;

    @Column(nullable = false)
    private Boolean activa = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    private LocalDateTime fechaActualizacion;
}
