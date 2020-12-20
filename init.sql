CREATE USER 'api'@'localhost' IDENTIFIED BY 'totallysecurepassword';

create database if not exists final_project;

GRANT ALL PRIVILEGES ON final_project.* TO 'api'@'localhost' ;

use final_project;

create table if not exists questions (
    `id` VARCHAR(64) NOT NULL,
    `prompt` VARCHAR(1000) NOT NULL,
    `order` INT NOT NULL,
    PRIMARY KEY (id)
);

create table if not exists question_choices (
    `id` VARCHAR(64) NOT NULL,
    `question_id` VARCHAR(64) NOT NULL,
    `value` VARCHAR(1000) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE CASCADE
);

create table if not exists responses (
    `id` VARCHAR(64) NOT NULL,
    `user_id` VARCHAR(500) NOT NULL,
    `submission_timestamp` TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

create table if not exists response_answers (
    `response_id` VARCHAR(64) NOT NULL,
    `question_id` VARCHAR(64) NOT NULL,
    `choice_id` VARCHAR(64) NOT NULL,
    PRIMARY KEY (response_id, question_id),
    FOREIGN KEY(response_id)
        REFERENCES responses(id)
        ON DELETE CASCADE,
    FOREIGN KEY(choice_id)
        REFERENCES question_choices(id)
        ON DELETE CASCADE
);