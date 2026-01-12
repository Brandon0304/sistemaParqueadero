package com.parqueadero.repository;

import com.parqueadero.model.Ticket;
import com.parqueadero.model.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    Optional<Ticket> findByCodigo(String codigo);
    
    @Query("SELECT t FROM Ticket t WHERE t.vehiculo = ?1 AND t.estado = 'ACTIVO'")
    Optional<Ticket> findTicketActivoByVehiculo(Vehiculo vehiculo);
    
    List<Ticket> findByEstado(Ticket.EstadoTicket estado);
    
    @Query("SELECT t FROM Ticket t WHERE t.fechaHoraEntrada BETWEEN ?1 AND ?2")
    List<Ticket> findByFechaHoraEntradaBetween(LocalDateTime inicio, LocalDateTime fin);
    
    Boolean existsByCodigo(String codigo);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.vehiculo.tipo = :tipoVehiculo AND t.estado = :estado")
    long countByVehiculoTipoAndEstado(@Param("tipoVehiculo") Vehiculo.TipoVehiculo tipoVehiculo, 
                                       @Param("estado") Ticket.EstadoTicket estado);
}
