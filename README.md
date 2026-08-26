# pharmozgen.me — personal website

Source code for the personal resume & academic website of **Ahmet Ozan Özgen**, live at **[https://pharmozgen.me](https://pharmozgen.me)**.

The site presents my resume/CV, publications, projects, and background in clinical research, medical biotechnology, and machine learning for drug discovery.

## Tech stack

- [Jekyll](https://jekyllrb.com/) static site generator
- Based on the **[al-folio](https://github.com/alshedivat/al-folio)** theme (MIT license — see [LICENSE](LICENSE); upstream theme copyright Maruan Al-Shedivat). Site content (resume data, posts, projects) © Ahmet Ozan Özgen.
- Deployed to **GitHub Pages** with the custom domain `pharmozgen.me`

## How to deploy / update

Deployment is fully automated via GitHub Actions:

1. Edit content (see below) and push to `main` (or open a pull request).
2. The **Deploy site** workflow (`.github/workflows/deploy.yml`) builds the site with Jekyll and publishes the result to GitHub Pages.
3. Supporting workflows: Prettier formatting checks, lychee broken-link checks (build output and external links), and CodeQL analysis.

### Where the content lives

| Content | Location |
|---|---|
| Homepage / about | `_pages/about.md` |
| CV page & data | `_pages/cv.md`, `assets/json/resume.json` |
| Social links | `_data/socials.yml` |
| Publications | `_bibliography/papers.bib` |
| Projects | `_projects/` |
| News | `_news/` |
| Site settings | `_config.yml` |

### Formatting

Prettier is enforced in CI. To format locally:

```bash
npm install
npx prettier . --write
```

### Local development

A `Dockerfile` and `docker-compose.yml` are included for local preview:

```bash
docker compose up
```

Alternatively, install Ruby + Bundler and run `bundle install && bundle exec jekyll serve`.

## License

Theme: MIT (see [LICENSE](LICENSE), © Maruan Al-Shedivat). Original site content © Ahmet Ozan Özgen.
