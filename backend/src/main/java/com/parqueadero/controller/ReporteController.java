package com.parqueadero.controller;

import com.parqueadero.dto.TicketFiltroRequest;
import com.parqueadero.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/reportes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReporteController {

    private final ReporteService reporteService;

    /**
     * GET /api/reportes/tickets/excel
     * Genera y descarga un archivo Excel con los tickets filtrados
     */
    @GetMapping("/tickets/excel")
    public ResponseEntity<byte[]> exportarTicketsExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta,
            @RequestParam(required = false) String tipoVehiculo,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String placa
    ) throws IOException {
        
        // Crear objeto de filtros
        TicketFiltroRequest filtro = new TicketFiltroRequest();
        filtro.setFechaDesde(fechaDesde);
        filtro.setFechaHasta(fechaHasta);
        filtro.setTipoVehiculo(tipoVehiculo);
        filtro.setEstado(estado);
        filtro.setPlaca(placa);

        // Generar Excel
        byte[] excelBytes = reporteService.generarReporteExcel(filtro);

        // Nombre del archivo con timestamp
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = "tickets_" + timestamp + ".xlsx";

        // Headers para descarga
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(excelBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }

    /**
     * GET /api/reportes/tickets/pdf
     * Genera y descarga un archivo PDF con los tickets filtrados
     */
    @GetMapping("/tickets/pdf")
    public ResponseEntity<byte[]> exportarTicketsPDF(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta,
            @RequestParam(required = false) String tipoVehiculo,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String placa
    ) throws IOException {
        
        // Crear objeto de filtros
        TicketFiltroRequest filtro = new TicketFiltroRequest();
        filtro.setFechaDesde(fechaDesde);
        filtro.setFechaHasta(fechaHasta);
        filtro.setTipoVehiculo(tipoVehiculo);
        filtro.setEstado(estado);
        filtro.setPlaca(placa);

        // Generar PDF
        byte[] pdfBytes = reporteService.generarReportePDF(filtro);

        // Nombre del archivo con timestamp
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = "tickets_" + timestamp + ".pdf";

        // Headers para descarga
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
