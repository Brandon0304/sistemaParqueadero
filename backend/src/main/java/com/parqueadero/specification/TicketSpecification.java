package com.parqueadero.specification;

import com.parqueadero.dto.TicketFiltroRequest;
import com.parqueadero.model.Ticket;
import com.parqueadero.model.Vehiculo;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class TicketSpecification {

    public static Specification<Ticket> conFiltros(TicketFiltroRequest filtro) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filtro por fecha desde
            if (filtro.getFechaDesde() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("fechaHoraEntrada"), 
                        filtro.getFechaDesde()
                ));
            }

            // Filtro por fecha hasta
            if (filtro.getFechaHasta() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("fechaHoraEntrada"), 
                        filtro.getFechaHasta()
                ));
            }

            // Filtro por tipo de vehículo
            if (filtro.getTipoVehiculo() != null && !filtro.getTipoVehiculo().isEmpty()) {
                Join<Ticket, Vehiculo> vehiculoJoin = root.join("vehiculo");
                predicates.add(criteriaBuilder.equal(
                        vehiculoJoin.get("tipo"), 
                        Vehiculo.TipoVehiculo.valueOf(filtro.getTipoVehiculo())
                ));
            }

            // Filtro por estado
            if (filtro.getEstado() != null && !filtro.getEstado().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        root.get("estado"), 
                        Ticket.EstadoTicket.valueOf(filtro.getEstado())
                ));
            }

            // Filtro por placa
            if (filtro.getPlaca() != null && !filtro.getPlaca().isEmpty()) {
                Join<Ticket, Vehiculo> vehiculoJoin = root.join("vehiculo");
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.upper(vehiculoJoin.get("placa")),
                        "%" + filtro.getPlaca().toUpperCase() + "%"
                ));
            }

            // Ordenar por fecha de entrada descendente (más recientes primero)
            query.orderBy(criteriaBuilder.desc(root.get("fechaHoraEntrada")));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
