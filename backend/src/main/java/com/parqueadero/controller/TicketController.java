package com.parqueadero.controller;

import com.parqueadero.dto.CalculoTarifaResponse;
import com.parqueadero.dto.PagedResponse;
import com.parqueadero.dto.TicketEntradaRequest;
import com.parqueadero.dto.TicketFiltroRequest;
import com.parqueadero.dto.TicketResponse;
import com.parqueadero.service.PdfService;
import com.parqueadero.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/tickets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private com.parqueadero.service.TicketPdfService ticketPdfService;

    @Autowired
    private com.parqueadero.service.ReporteService reporteService;

    @PostMapping("/entrada")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<TicketResponse> registrarEntrada(@Valid @RequestBody TicketEntradaRequest request) {
        TicketResponse response = ticketService.registrarEntrada(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/salida/{codigo}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<TicketResponse> registrarSalida(@PathVariable String codigo) {
        TicketResponse response = ticketService.registrarSalida(codigo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{codigo}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<TicketResponse> obtenerPorCodigo(@PathVariable String codigo) {
        TicketResponse response = ticketService.obtenerPorCodigo(codigo);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<List<TicketResponse>> listarTodos() {
        List<TicketResponse> tickets = ticketService.listarTodos();
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/activos")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<List<TicketResponse>> listarActivos() {
        List<TicketResponse> tickets = ticketService.listarActivos();
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/filtrar")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<PagedResponse<TicketResponse>> listarConFiltros(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta,
            @RequestParam(required = false) String tipoVehiculo,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String placa,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size
    ) {
        TicketFiltroRequest filtro = new TicketFiltroRequest();
        filtro.setFechaDesde(fechaDesde);
        filtro.setFechaHasta(fechaHasta);
        filtro.setTipoVehiculo(tipoVehiculo);
        filtro.setEstado(estado);
        filtro.setPlaca(placa);
        filtro.setPage(page);
        filtro.setSize(size);

        PagedResponse<TicketResponse> response = ticketService.listarConFiltros(filtro);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/calcular/{codigo}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<CalculoTarifaResponse> calcularTarifa(@PathVariable String codigo) {
        CalculoTarifaResponse response = ticketService.calcularTarifa(codigo);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/cancelar/{codigo}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> cancelarTicket(@PathVariable String codigo) {
        ticketService.cancelarTicket(codigo);
        return ResponseEntity.ok("Ticket cancelado exitosamente");
    }

    @GetMapping("/{codigo}/factura")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<byte[]> descargarFactura(@PathVariable String codigo) {
        try {
            byte[] pdfBytes = pdfService.generarFacturaTicket(codigo);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "factura-" + codigo + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Genera el TICKET DE ENTRADA en PDF (con QR para escanear)
     * Se genera inmediatamente después de registrar la entrada
     */
    @GetMapping("/{codigo}/ticket-entrada")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<byte[]> descargarTicketEntrada(@PathVariable String codigo) {
        try {
            TicketResponse ticketResponse = ticketService.obtenerPorCodigo(codigo);
            com.parqueadero.model.Ticket ticket = ticketService.buscarPorCodigo(codigo);
            byte[] pdfBytes = ticketPdfService.generarTicketEntrada(ticket);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "ticket-entrada-" + codigo + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Genera la FACTURA DE PAGO en PDF (después de pagar y salir)
     * Reemplaza el endpoint antiguo con una factura más detallada
     */
    @GetMapping("/{codigo}/factura-pago")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERADOR')")
    public ResponseEntity<byte[]> descargarFacturaPago(@PathVariable String codigo) {
        try {
            com.parqueadero.model.Ticket ticket = ticketService.buscarPorCodigo(codigo);
            
            // Solo se puede generar factura si el ticket está PAGADO
            if (!"PAGADO".equals(ticket.getEstado().toString())) {
                return ResponseEntity.badRequest().build();
            }
            
            byte[] pdfBytes = reporteService.generarFacturaPdf(ticket);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "factura-pago-" + codigo + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
