package com.parqueadero.service;

import com.parqueadero.dto.CalculoTarifaResponse;
import com.parqueadero.dto.PagedResponse;
import com.parqueadero.dto.TicketEntradaRequest;
import com.parqueadero.dto.TicketFiltroRequest;
import com.parqueadero.dto.TicketResponse;
import com.parqueadero.dto.VehiculoRequest;
import com.parqueadero.exception.BusinessException;
import com.parqueadero.exception.ResourceNotFoundException;
import com.parqueadero.model.Tarifa;
import com.parqueadero.model.Ticket;
import com.parqueadero.model.Usuario;
import com.parqueadero.model.Vehiculo;
import com.parqueadero.pattern.factory.TicketFactory;
import com.parqueadero.pattern.state.TicketStateContext;
import com.parqueadero.pattern.strategy.TarifaStrategy;
import com.parqueadero.repository.TarifaRepository;
import com.parqueadero.repository.TicketRepository;
import com.parqueadero.repository.UsuarioRepository;
import com.parqueadero.repository.VehiculoRepository;
import com.parqueadero.specification.TicketSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private VehiculoRepository vehiculoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TarifaRepository tarifaRepository;

    @Autowired
    private TicketFactory ticketFactory;

    @Autowired
    private TicketStateContext stateContext;

    @Autowired
    private TarifaStrategy tarifaStrategy;
    
    @Autowired
    private VehiculoService vehiculoService;
    
    @Autowired
    private ConfiguracionService configuracionService;

    @Transactional
    public TicketResponse registrarEntrada(TicketEntradaRequest request) {
        Vehiculo vehiculo;
        
        // Si se proporciona vehiculoId, buscar el vehículo existente
        if (request.getVehiculoId() != null) {
            vehiculo = vehiculoRepository.findById(request.getVehiculoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehiculo", "id", request.getVehiculoId()));
        } 
        // Si no hay vehiculoId pero sí datos del vehículo, intentar buscar o crear
        else if (request.getPlaca() != null && !request.getPlaca().trim().isEmpty()) {
            // Intentar buscar el vehículo por placa (PlacaUtil normalizará automáticamente)
            try {
                vehiculo = vehiculoService.obtenerPorPlaca(request.getPlaca());
            } catch (ResourceNotFoundException e) {
                // Si no existe, crearlo inline
                com.parqueadero.dto.VehiculoRequest vehiculoRequest = new com.parqueadero.dto.VehiculoRequest(
                        request.getPlaca(),
                        request.getTipo(),
                        request.getMarca(),
                        request.getModelo(),
                        request.getColor()
                );
                vehiculo = vehiculoService.registrarVehiculo(vehiculoRequest);
            }
        } else {
            throw new BusinessException("Debe proporcionar un vehiculoId o los datos del vehículo (placa y tipo)");
        }

        // Validar que hay espacio disponible para el tipo de vehículo
        if (!configuracionService.hayEspacioDisponible(vehiculo.getTipo())) {
            throw new BusinessException("No hay espacios disponibles para vehículos tipo " + vehiculo.getTipo());
        }

        // Verificar que no exista un ticket activo para el vehículo
        ticketRepository.findTicketActivoByVehiculo(vehiculo).ifPresent(t -> {
            throw new BusinessException("El vehículo ya tiene un ticket activo");
        });

        Usuario usuario = obtenerUsuarioActual();
        
        Ticket ticket = ticketFactory.crearTicketEntrada(vehiculo, usuario, request.getObservaciones());
        ticket = ticketRepository.save(ticket);

        return convertirAResponse(ticket);
    }

    @Transactional
    public TicketResponse registrarSalida(String codigo) {
        Ticket ticket = ticketRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "codigo", codigo));

        if (ticket.getEstado() != Ticket.EstadoTicket.ACTIVO) {
            throw new BusinessException("El ticket no está activo");
        }

        Usuario usuario = obtenerUsuarioActual();
        ticket.setUsuarioSalida(usuario);

        // Calcular tarifa
        Tarifa tarifa = tarifaRepository.findByTipoVehiculoAndActivaTrue(ticket.getVehiculo().getTipo())
                .orElseThrow(() -> new BusinessException("No hay tarifa configurada para este tipo de vehículo"));

        ticket.setMontoTotal(tarifaStrategy.calcularTarifa(
                ticket.getFechaHoraEntrada(),
                LocalDateTime.now(),
                tarifa
        ));

        // Cambiar estado usando el patrón State
        stateContext.procesarPago(ticket);
        
        ticket = ticketRepository.save(ticket);

        return convertirAResponse(ticket);
    }

    public TicketResponse obtenerPorCodigo(String codigo) {
        Ticket ticket = ticketRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "codigo", codigo));
        return convertirAResponse(ticket);
    }

    public List<TicketResponse> listarTodos() {
        return ticketRepository.findAll().stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> listarActivos() {
        return ticketRepository.findByEstado(Ticket.EstadoTicket.ACTIVO).stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
    }

    public PagedResponse<TicketResponse> listarConFiltros(TicketFiltroRequest filtro) {
        Pageable pageable = PageRequest.of(
                filtro.getPage() != null ? filtro.getPage() : 0,
                filtro.getSize() != null ? filtro.getSize() : 20
        );

        Page<Ticket> page = ticketRepository.findAll(
                TicketSpecification.conFiltros(filtro),
                pageable
        );

        List<TicketResponse> content = page.getContent().stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }

    public CalculoTarifaResponse calcularTarifa(String codigo) {
        Ticket ticket = ticketRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "codigo", codigo));

        if (ticket.getEstado() != Ticket.EstadoTicket.ACTIVO) {
            throw new BusinessException("El ticket no está activo");
        }

        Tarifa tarifa = tarifaRepository.findByTipoVehiculoAndActivaTrue(ticket.getVehiculo().getTipo())
                .orElseThrow(() -> new BusinessException("No hay tarifa configurada para este tipo de vehículo"));

        LocalDateTime ahora = LocalDateTime.now();
        Duration duracion = Duration.between(ticket.getFechaHoraEntrada(), ahora);

        CalculoTarifaResponse response = new CalculoTarifaResponse();
        response.setMontoTotal(tarifaStrategy.calcularTarifa(ticket.getFechaHoraEntrada(), ahora, tarifa));
        response.setMinutosTranscurridos(duracion.toMinutes());
        response.setHorasTranscurridas(duracion.toHours());
        response.setTipoVehiculo(ticket.getVehiculo().getTipo().name());
        response.setDetalleCalculo(tarifaStrategy.getDetalleCalculo(ticket.getFechaHoraEntrada(), ahora, tarifa));

        return response;
    }

    @Transactional
    public void cancelarTicket(String codigo) {
        Ticket ticket = ticketRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "codigo", codigo));

        stateContext.cancelar(ticket);
        ticketRepository.save(ticket);
    }

    private Usuario obtenerUsuarioActual() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "username", userDetails.getUsername()));
    }

    private TicketResponse convertirAResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setCodigo(ticket.getCodigo());
        response.setPlacaVehiculo(ticket.getVehiculo().getPlaca());
        response.setTipoVehiculo(ticket.getVehiculo().getTipo().name());
        response.setFechaHoraEntrada(ticket.getFechaHoraEntrada());
        response.setFechaHoraSalida(ticket.getFechaHoraSalida());
        response.setMontoTotal(ticket.getMontoTotal());
        response.setEstado(ticket.getEstado().name());
        response.setObservaciones(ticket.getObservaciones());
        response.setUsuarioEntrada(ticket.getUsuarioEntrada().getUsername());
        response.setUsuarioSalida(ticket.getUsuarioSalida() != null ? 
                ticket.getUsuarioSalida().getUsername() : null);
        return response;
    }
}
