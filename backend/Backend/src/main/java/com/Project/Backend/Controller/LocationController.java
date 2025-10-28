package com.Project.Backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/location")
public class LocationController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String PSGC_BASE_URL = "https://psgc.gitlab.io/api";

    @GetMapping("/regions")
    public ResponseEntity<String> getRegions() {
        try {
            String url = PSGC_BASE_URL + "/regions/";
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(response);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching regions: " + e.getMessage());
        }
    }

    @GetMapping("/regions/{regionCode}/provinces")
    public ResponseEntity<String> getProvinces(@PathVariable String regionCode) {
        try {
            String url = PSGC_BASE_URL + "/regions/" + regionCode + "/provinces/";
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(response);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching provinces: " + e.getMessage());
        }
    }

    @GetMapping("/provinces/{provinceCode}/cities-municipalities")
    public ResponseEntity<String> getCitiesMunicipalities(@PathVariable String provinceCode) {
        try {
            String url = PSGC_BASE_URL + "/provinces/" + provinceCode + "/cities-municipalities/";
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(response);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching cities/municipalities: " + e.getMessage());
        }
    }

    @GetMapping("/cities-municipalities/{cityCode}/barangays")
    public ResponseEntity<String> getBarangays(@PathVariable String cityCode) {
        try {
            String url = PSGC_BASE_URL + "/cities-municipalities/" + cityCode + "/barangays/";
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(response);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching barangays: " + e.getMessage());
        }
    }
}
