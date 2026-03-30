package com.jira.clone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class JiraCloneApplication {

	public static void main(String[] args) {
		SpringApplication.run(JiraCloneApplication.class, args);
	}

}
