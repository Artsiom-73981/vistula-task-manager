# Vistula Task Manager

Simple task manager made for the Team Project – IT course. Tasks are stored in Supabase and the app talks to the Supabase REST API with `fetch()`.

**Student ID:** 73981

## Links

- Application: https://artsiom-73981.github.io/vistula-task-manager/
- Repository: https://github.com/Artsiom-73981/vistula-task-manager
- Contribution page: https://artsiom-73981.github.io/vistula-task-manager/contribution.html
- Contribution JSON: https://artsiom-73981.github.io/vistula-task-manager/contribution.json

## Features

- list all tasks
- add a task
- edit title and description
- mark task as completed / not completed
- delete a task

## Tech

- HTML, CSS, JavaScript
- Supabase (PostgreSQL + REST API)
- GitHub Pages

## Database

Table `tasks`:

| column      | type    | notes                         |
|-------------|---------|-------------------------------|
| id          | bigint  | primary key, generated        |
| title       | text    | required                      |
| description | text    | optional                      |
| completed   | boolean | default false                 |

## Pull Requests

- Incoming PR (partner's contribution to this repo): TODO
- Outgoing PR (my contribution to partner's repo): TODO
