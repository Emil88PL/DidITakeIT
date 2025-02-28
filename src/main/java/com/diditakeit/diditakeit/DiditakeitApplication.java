package com.diditakeit.diditakeit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DiditakeitApplication {

	public static void main(String[] args) {
		SpringApplication.run(DiditakeitApplication.class, args);
	}

}
