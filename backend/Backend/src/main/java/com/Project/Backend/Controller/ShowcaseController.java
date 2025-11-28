package com.Project.Backend.Controller;

import com.Project.Backend.DTO.ShowcaseDTO;
import com.Project.Backend.Entity.ShowcaseEntity;
import com.Project.Backend.Entity.ShowcaseMediaEntity;
import com.Project.Backend.Repository.ShowcaseRepository;
import com.Project.Backend.Service.ShowcaseMediaService;
import com.Project.Backend.Service.ShowcaseService;
import org.apache.coyote.Response;
import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.swing.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/showcase")
public class ShowcaseController {

    @Autowired
    private ShowcaseService showcaseService;
    @Autowired
    private ShowcaseMediaService showcaseMediaService;

    @PostMapping(value = "/create-showcase")
    public ResponseEntity<?> addNewShowcase(@RequestBody ShowcaseDTO showcaseDTO) {
        try {
            ShowcaseEntity showcase = showcaseService.createShowcase(showcaseDTO);
            if (showcaseDTO.getImageUrls().isEmpty()) {
                System.out.println("No images");
            }
            showcaseMediaService.createShowcaseMedia(showcaseDTO.getImageUrls(), showcase);
            return ResponseEntity.ok().body(showcase);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/getshowcase/{email}")
    public ResponseEntity<?> getShowcaseByServiceName(@PathVariable String email) {
        try {
            List<ShowcaseEntity> showcase = showcaseService.getAllShowcaseByUserEmail(email);
            // Collection endpoints should return 200 with empty list, not 404
            if (showcase == null) {
                return ResponseEntity.ok().body(List.of());
            }
            return ResponseEntity.ok().body(showcase);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{showcase_id}")
    public ResponseEntity<?> deleteShowcase(@PathVariable int showcase_id) {

        String message = showcaseService.deleteShowcase(showcase_id);
        if (message == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(message);
    }

    @PutMapping("/edit-showcase/{showcase_id}")
    public ResponseEntity<?> editShowcase(
            @RequestBody ShowcaseDTO showcaseDTO,
            @PathVariable int showcase_id) {
        System.out.println(showcaseDTO.getDeletedFileIds());
        try {
            ShowcaseEntity updatedShowcase = showcaseService.editShowcase(showcaseDTO, showcase_id);

            if (showcaseDTO.getDeletedFileIds() != null) {
                showcaseMediaService.deleteMediaByIds(showcaseDTO.getDeletedFileIds());
                showcaseMediaService.createShowcaseMedia(showcaseDTO.getImageUrls(), updatedShowcase);
            }

            return ResponseEntity.ok().body(updatedShowcase);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
