package com.Project.Backend.Security;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

@EnableWebSecurity
@Configuration
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Autowired
    private UserDetailsService userDetailsService;

    private final RsaKeyProperties rsaKeyProperties;

    public SecurityConfig(RsaKeyProperties rsaKeyProperties) {
        this.rsaKeyProperties = rsaKeyProperties;
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withPublicKey(rsaKeyProperties.publicKey()).build();
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        JWK jwk = new RSAKey.Builder(rsaKeyProperties.publicKey()).privateKey(rsaKeyProperties.privateKey()).build();
        JWKSource<SecurityContext> jwks = new ImmutableJWKSet<>(new JWKSet(jwk));
        return new NimbusJwtEncoder(jwks);
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = jwt.getClaim("role");
            return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
        });
        return converter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(configurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/user/login").permitAll()
                        .requestMatchers("/user/register").permitAll()
                        .requestMatchers("/user/check-user").permitAll()
                        .requestMatchers("/user/reset-password").permitAll()
                        .requestMatchers("/user/verify-token").permitAll()
                        .requestMatchers("/user/getCustomers").hasRole("ADMIN")
                        .requestMatchers("/user/getcurrentuser").authenticated()
                        .requestMatchers("/regularuser/create").permitAll()
                        .requestMatchers("/subcontractor/create", "/subcontractor/login").permitAll()
                        // Subcontractor admin-only endpoints
                        .requestMatchers(HttpMethod.GET, "/subcontractor/getall").permitAll()
                        .requestMatchers(HttpMethod.GET, "/subcontractor/category-counts").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/subcontractor/create-basic").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/subcontractor/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/subcontractor/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/subcontractor/check-email/{email}").hasRole("ADMIN")
                        // Subcontractor shared endpoints
                        .requestMatchers(HttpMethod.GET, "/subcontractor/{id}").hasAnyRole("ADMIN", "SUBCONTRACTOR")
                        // Remaining subcontractor endpoints
                        .requestMatchers("/subcontractor/**").hasAnyRole("ADMIN", "SUBCONTRACTOR")
                        // Transactions admin-only endpoints
                        .requestMatchers(HttpMethod.GET, "/api/transactions/getAllTransactions").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/transactions/validateTransaction").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/transactions/getAllPendingTransactions").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/transactions/event-progress/{id}").hasAnyRole("ADMIN","USER")
                        .requestMatchers(HttpMethod.GET, "/api/transactions/subcontractor-progress/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/transactions/updateProgress/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/transactions/subcontractor-progress/id/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/transactions/subcontractor-progress/id/{id}").hasAnyRole("ADMIN","SUBCONTRACTOR")
                        // Remaining transactions endpoints
                        .requestMatchers("/api/transactions/**").hasAnyRole("USER", "ADMIN", "SUBCONTRACTOR")
                        // Events admin-only endpoints
                        .requestMatchers(HttpMethod.POST, "/api/events/createEvent").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/events").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/events/upload/image/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/events/{id}").hasRole("ADMIN")
                        // Remaining events endpoints
                        .requestMatchers("/api/events/event-details/**").permitAll()
                        .requestMatchers("/api/events/**").hasAnyRole("USER", "ADMIN")
                        // Notifications admin-only endpoints
                        .requestMatchers(HttpMethod.POST, "/api/notifications/booking-approved").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/notifications/notify-subcontractors-by-id").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/notifications/booking-rejected").hasRole("ADMIN")
                        // Remaining notifications endpoints
                        .requestMatchers("/api/notifications/**").permitAll()
                        // Package admin-only endpoints
                        .requestMatchers(HttpMethod.GET, "/package/getall").permitAll()
                        .requestMatchers(HttpMethod.GET, "/package/getServices/{name}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/package/create").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/package/update").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/package/upload/image/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/package/delete/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/package/addService").hasRole("ADMIN")
                        // Remaining package endpoints
                        .requestMatchers("/package/**").hasAnyRole("USER", "ADMIN")
                        // Booking rejection note admin-only endpoints
                        .requestMatchers(HttpMethod.GET, "/bookingrejectionnote/generate-PresignedUrl").hasRole("ADMIN")
                        // Remaining booking rejection note endpoints
                        .requestMatchers("/bookingrejectionnote/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/showcase/**").hasAnyRole("USER", "ADMIN", "SUBCONTRACTOR")
                        .requestMatchers("/showcasemedia/**").hasAnyRole("USER", "ADMIN", "SUBCONTRACTOR")
                        .requestMatchers("/serviceoffering/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/payment/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/form-draft/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/email/**").permitAll() //temporary
                        .requestMatchers("/location/**").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .httpBasic(Customizer.withDefaults())
                .build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(bCryptPasswordEncoder());
        return provider;
    }

    @Bean
    CorsConfigurationSource configurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://54.179.192.129",
                "https://eventsease.app",
                "https://www.eventsease.app"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
