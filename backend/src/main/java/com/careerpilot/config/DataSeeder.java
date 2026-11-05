package com.careerpilot.config;

import com.careerpilot.model.*;
import com.careerpilot.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
    @Bean CommandLineRunner seedDemoData(UserRepository users, ProfileRepository profiles, JobRepository jobs,
                                          PasswordEncoder encoder, @Value("${app.seed.enabled:true}") boolean enabled) {
        return args -> {
            if (!enabled || users.count() > 0) return;
            AppUser student=users.save(new AppUser("Yograj Sikka","student@careerpilot.ai",encoder.encode("CareerPilot@123"),Role.STUDENT));
            AppUser recruiter=users.save(new AppUser("Maya Kapoor","recruiter@careerpilot.ai",encoder.encode("CareerPilot@123"),Role.RECRUITER));
            users.save(new AppUser("Platform Admin","admin@careerpilot.ai",encoder.encode("CareerPilot@123"),Role.ADMIN));

            StudentProfile profile=new StudentProfile(student);
            profile.setHeadline("Computer Science Student | Aspiring Full-Stack Developer");
            profile.setUniversity("Northstar Institute of Technology"); profile.setDegree("B.Tech Computer Science");
            profile.setGraduationYear(2027); profile.setCgpa(8.4); profile.setLocation("Bengaluru, India");
            profile.setSkills("Java, Spring Boot, JavaScript, HTML, CSS, React, MySQL, REST APIs, Git, Python, Data Structures, OOP");
            profile.setConfidence(72); profile.setGithubUrl("https://github.com/Yograj-Sikka"); profile.setLinkedinUrl("https://www.linkedin.com/in/yograj-sikka/");
            profile.setBio("Curious software engineering student who enjoys building useful products and learning backend development.");
            profile.setResumeText("YOGRAJ SIKKA\nEDUCATION\nB.Tech Computer Science, Northstar Institute of Technology, 2027\nSKILLS\nJava, Spring Boot, JavaScript, React, MySQL, REST APIs, Git, Python, Data Structures\nPROJECTS\nBuilt a student productivity dashboard with REST APIs and MySQL. Developed reusable UI components and improved page loading by 25%.\nEXPERIENCE\nSoftware Engineering Intern - Built and tested APIs, collaborated through GitHub pull requests.");
            profiles.save(profile);

            jobs.save(new Job("Java Backend Intern","Nexora Labs","Bengaluru / Hybrid","Internship","Entry level","₹20k–35k / month",
                "Build REST APIs, collaborate with product engineers, write tests and work with relational databases.","Java, Spring Boot, REST APIs, MySQL, Git, JUnit",7.0,recruiter));
            jobs.save(new Job("Full-Stack Developer Intern","BrightLayer","Remote · India","Internship","Entry level","₹25k–40k / month",
                "Build customer-facing features across a modern frontend and backend. Work with APIs, relational data and responsive interfaces.","JavaScript, React, HTML, CSS, REST APIs, SQL, Git",7.0,recruiter));
            jobs.save(new Job("Associate Software Engineer","CloudCanvas","Pune, India","Full-time","Fresher","₹6–9 LPA",
                "Join an engineering team building cloud-connected business applications. Participate in design, development, testing and deployment.","Java, OOP, Data Structures, SQL, REST APIs, Docker, Git",7.5,recruiter));
            jobs.save(new Job("Python & AI Engineering Intern","ModelMint","Remote · India","Internship","Entry level","₹18k–30k / month",
                "Prepare datasets, prototype ML workflows, build Python APIs and communicate model results to the product team.","Python, Machine Learning, Pandas, Scikit-learn, FastAPI, SQL",7.0,recruiter));
            jobs.save(new Job("Frontend Engineering Intern","PixelNorth","Delhi NCR, India","Internship","Entry level","₹15k–25k / month",
                "Create accessible web experiences, integrate APIs and work with designers to refine product journeys.","JavaScript, HTML, CSS, React, Tailwind CSS, REST APIs",6.5,recruiter));
            jobs.save(new Job("Graduate Software Engineer","Orbit Systems","Hyderabad, India","Full-time","Fresher","₹7–11 LPA",
                "Work on enterprise software with strong engineering practices, code reviews, automated tests and scalable services.","Java, Spring Boot, SQL, System Design, Testing, Git, Docker",7.5,recruiter));
            jobs.save(new Job("Data Analyst Intern","MetricWorks","Mumbai / Hybrid","Internship","Entry level","₹18k–28k / month",
                "Analyze product datasets, write SQL queries and turn data into insights for product and operations teams.","Python, SQL, Excel, Pandas, Data Visualization, Statistics",7.0,recruiter));
            jobs.save(new Job("Cloud & DevOps Intern","StackHarbor","Remote · India","Internship","Entry level","₹20k–32k / month",
                "Support build pipelines, containerized services, cloud environments and application monitoring.","Linux, Docker, CI/CD, Git, AWS, Networking, Bash",7.0,recruiter));
        };
    }
}
