package com.parqueadero.pattern.factory;

import com.parqueadero.model.Vehiculo;
import org.springframework.stereotype.Component;

/**
 * Patrón Factory para la creación de Vehículos
 */
@Component
public class VehiculoFactory {

    public Vehiculo crearVehiculo(String placa, String tipo, String marca, String modelo, String color) {
        Vehiculo vehiculo = new Vehiculo();
        vehiculo.setPlaca(placa.toUpperCase());
        vehiculo.setTipo(Vehiculo.TipoVehiculo.valueOf(tipo.toUpperCase()));
        vehiculo.setMarca(marca);
        vehiculo.setModelo(modelo);
        vehiculo.setColor(color);
        return vehiculo;
    }
}
