# CI/CD Hardening Plan (V2-1..V2-6)

**Status:** DRAFT PLAN — not yet applied to `.github/workflows/`.
The automation token used to prepare this branch lacks the `workflow` OAuth
scope, so GitHub refused writes to any path under `.github/workflows/`
(403 "insufficient scopes"). Only `.github/dependabot.yml` could be committed
directly. This document contains the **complete, final, intended contents** of
every workflow file that needs to change. No secrets or PII are included.

## How to apply

The repository owner (or a maintainer) can apply these changes with either:

1. A locally authenticated `gh` / git client whose token includes the
   `workflow` scope:
   - copy each fenced block below over the file named in its heading, commit,
     and push onto this branch (`remediation/v2-ci-hardening`), then refresh
     the associated pull request; **or**
2. The GitHub web UI editor (web commits are exempt from the `workflow` scope
   requirement): open each target file, replace its contents with the
   corresponding block below, and commit to `remediation/v2-ci-hardening`.

All action SHAs below were resolved from the upstream repositories at
remediation time via the GitHub API (`get_tag` / `get_commit`) and are pinned
full-length commit SHAs with the original version tag kept as a trailing
`# vX.Y.Z` comment. `ruby/setup-ruby@v1` has no `v1` tag ref (404), so its SHA
was resolved by querying the `v1` ref as a commit; `browser-actions/setup-chrome@v1`
is an annotated tag and was dereferenced to its target commit.
`fjogeleit/yaml-update-action@main` is a floating branch and was pinned to the
head commit of `main` at remediation time.

---

## File: `.github/workflows/deploy.yml`

Fixes V2-1 (top-level `contents: write` combined with a `pull_request`
trigger). The build steps are byte-identical to the current workflow; the
single job is split into a read-only `build` job and a `deploy` job that only
runs on push/workflow_dispatch and is the only job granted `contents: write`.
The built `_site` directory is passed between jobs as a short-lived artifact.

```yaml
name: Deploy site

on:
  push:
    branches:
      - master
      - main
    paths:
      - "assets/**"
      - "_sass/**"
      - "**.bib"
      - "**.html"
      - "**.js"
      - "**.liquid"
      - "**/*.md"
      - "**.yml"
      - "Gemfile"
      - "Gemfile.lock"
      - "!.github/workflows/axe.yml"
      - "!.github/workflows/broken-links.yml"
      - "!.github/workflows/deploy-docker-tag.yml"
      - "!.github/workflows/deploy-image.yml"
      - "!.github/workflows/docker-slim.yml"
      - "!.github/workflows/lighthouse-badger.yml"
      - "!.github/workflows/prettier.yml"
      - "!lighthouse_results/**"
      - "!CONTRIBUTING.md"
      - "!CUSTOMIZE.md"
      - "!FAQ.md"
      - "!INSTALL.md"
      - "!README.md"
  pull_request:
    branches:
      - master
      - main
    paths:
      - "assets/**"
      - "_sass/**"
      - "**.bib"
      - "**.html"
      - "**.js"
      - "**.liquid"
      - "**/*.md"
      - "**.yml"
      - "Gemfile"
      - "Gemfile.lock"
      - "!.github/workflows/axe.yml"
      - "!.github/workflows/broken-links.yml"
      - "!.github/workflows/deploy-docker-tag.yml"
      - "!.github/workflows/deploy-image.yml"
      - "!.github/workflows/docker-slim.yml"
      - "!.github/workflows/lighthouse-badger.yml"
      - "!.github/workflows/prettier.yml"
      - "!lighthouse_results/**"
      - "!CONTRIBUTING.md"
      - "!CUSTOMIZE.md"
      - "!FAQ.md"
      - "!INSTALL.md"
      - "!README.md"
  workflow_dispatch:

# Least-privilege default: read-only for all jobs. Only the `deploy` job
# (push/workflow_dispatch events, never pull_request) escalates to
# contents: write via its job-level permissions block.
permissions:
  contents: read

jobs:
  build:
    # available images: https://github.com/actions/runner-images#available-images
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
      - name: Setup Ruby 💎
        uses: ruby/setup-ruby@14594264cd68ce8a2345dd349bc3d138a4ef85c8 # v1
        with:
          ruby-version: "3.3.5"
          bundler-cache: true
      - name: Setup Python 🐍
        uses: actions/setup-python@a26af69be951a213d495a4c3e4e4022e16d87065 # v5
        with:
          python-version: "3.13"
          cache: "pip" # caching pip dependencies
      - name: Update _config.yml ⚙️
        uses: fjogeleit/yaml-update-action@dffe9a5223d84653c13374032382f6bb5de8e5ef # main (floating branch pinned at remediation time)
        with:
          commitChange: false
          valueFile: "_config.yml"
          propertyPath: "giscus.repo"
          value: ${{ github.repository }}
      - name: Install and Build 🔧
        run: |
          sudo apt-get update && sudo apt-get install -y imagemagick
          pip3 install --upgrade nbconvert
          export JEKYLL_ENV=production
          bundle exec jekyll build
      - name: Purge unused CSS 🧹
        run: |
          npm install -g purgecss
          purgecss -c purgecss.config.js
      - name: Upload built site 📦
        uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4
        with:
          name: site
          path: _site
          retention-days: 1

  deploy:
    needs: build
    # Deploys only run on push/workflow_dispatch, never on pull_request,
    # and are the only jobs granted contents: write.
    if: github.event_name != 'pull_request'
    permissions:
      contents: write
    # available images: https://github.com/actions/runner-images#available-images
    runs-on: ubuntu-latest
    steps:
      - name: Download built site 📦
        uses: actions/download-artifact@d3f86a106a0bac45b974a628896c90dbdf5c8093 # v4
        with:
          name: site
          path: _site
      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@fa24774553152dd7873cd16ebd8d959b010c5445 # v4
        with:
          folder: _site
```

---

## File: `.github/workflows/lighthouse-badger.yml`

Fixes V2-3 (upstream template defaults: wrong URL, wrong branch, automatic
`page_build` trigger). Repaired in place: manual dispatch only, URLS now points
at `https://pharmozgen.me`, branch reference corrected to `main`, and a header
note documents the required `LIGHTHOUSE_BADGER_TOKEN` secret.

```yaml
# Lighthouse-Badger-Easy | GitHub Action Workflow
#
# Description: Generates, adds & updates manually/automatically Lighthouse badges & reports from one/multiple input URL(s) to the current repository & main branch with minimal settings
# Author: Sitdisch
# Source: https://github.com/myactionway/lighthouse-badger-workflows
# License: MIT
# Copyright (c) 2021 Sitdisch
#
# NOTE(remediation): This workflow requires a LIGHTHOUSE_BADGER_TOKEN secret
# (a PAT with write access to this repository) to be configured before it can
# be run successfully. URL/branch values below were corrected from upstream
# template defaults; manual trigger only.

name: "Lighthouse Badger"

########################################################################
# DEFINE YOUR INPUTS AND TRIGGERS IN THE FOLLOWING
########################################################################

# INPUTS as Secrets (env) for not manually triggered workflows
env:
  URLS: https://pharmozgen.me
  # If any of the following env is blank, a default value is used instead
  REPO_BRANCH: "${{ github.repository }} main" # target repository & branch e.g. 'dummy/mytargetrepo main'
  MOBILE_LIGHTHOUSE_PARAMS: "--only-categories=performance,accessibility,best-practices,seo --throttling.cpuSlowdownMultiplier=2"
  DESKTOP_LIGHTHOUSE_PARAMS: "--only-categories=performance,accessibility,best-practices,seo --preset=desktop --throttling.cpuSlowdownMultiplier=1"

# TRIGGERS
on:
  # schedule: # Check your schedule here => https://crontab.guru/
  #   - cron: '55 23 * * 0' # e.g. every Sunday at 23:55
  #
  # THAT'S IT; YOU'RE DONE;
  workflow_dispatch:

permissions:
  contents: read

########################################################################
# THAT'S IT; YOU DON'T HAVE TO DEFINE ANYTHING IN THE FOLLOWING
########################################################################

jobs:
  lighthouse-badger-easy:
    runs-on: ubuntu-latest
    timeout-minutes: 8
    steps:
      - name: Preparatory Tasks
        run: |
          REPOSITORY=`expr "${{ env.REPO_BRANCH }}" : "\([^ ]*\)"`
          BRANCH=`expr "${{ env.REPO_BRANCH }}" : ".* \([^ ]*\)"`
          echo "REPOSITORY=$REPOSITORY" >> $GITHUB_ENV
          echo "BRANCH=$BRANCH" >> $GITHUB_ENV
        env:
          REPO_BRANCH: ${{ env.REPO_BRANCH }}
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
        with:
          repository: ${{ env.REPOSITORY }}
          token: ${{ secrets.LIGHTHOUSE_BADGER_TOKEN }}
          ref: ${{ env.BRANCH }}
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
        with:
          repository: "myactionway/lighthouse-badges"
          path: temp_lighthouse_badges_nested
      - uses: myactionway/lighthouse-badger-action@0064f8e52023fe836d42f65e71231c54a93f7d0b # v2.2
        with:
          urls: ${{ env.URLS }}
          mobile_lighthouse_params: ${{ env.MOBILE_LIGHTHOUSE_PARAMS }}
          desktop_lighthouse_params: ${{ env.DESKTOP_LIGHTHOUSE_PARAMS }}
```

---

## File: `.github/workflows/deploy-image.yml`

Fixes V2-3 (gated on upstream owner `alshedivat`, automatic push trigger).
Automatic runs disabled (manual dispatch only); owner gate corrected to
`OzgenOzan`; image names left unchanged but flagged as upstream namespace.

```yaml
name: Docker Image CI

# NOTE(remediation): automatic push triggers disabled; manual dispatch only.
# Image tags below still point to the upstream template namespace
# (amirpourmand/al-folio) and must be updated to this repository's own
# namespace before the first real use.

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    if: github.repository_owner == 'OzgenOzan'

    steps:
      - name: Checkout
        uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@c7c53464625b32c7a7e944ae62b3e17d2b600130 # v3

      - name: Buildx
        uses: docker/setup-buildx-action@8d2750c68a42422c14e847fe6c8ac0403b4cbd6f # v3

      - name: Login
        uses: docker/login-action@c94ce9fb468520275223c153574b00df6fe4bcc9 # v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@ca052bb54ab0790a636c9b5f226502c73d547a25 # v5
        with:
          context: .
          push: true
          platforms: linux/amd64,linux/arm64/v8
          tags: amirpourmand/al-folio
```

---

## File: `.github/workflows/docker-slim.yml`

Fixes V2-3 (gated on upstream owner `alshedivat`, automatic push/workflow_run
triggers). Manual dispatch only; owner gate corrected to `OzgenOzan`; the
`workflow_run` conclusion check was removed because that event can no longer
occur; image names flagged as upstream namespace.

```yaml
name: Docker Slim

# NOTE(remediation): automatic push/workflow_run triggers disabled; manual
# dispatch only. Image names below still point to the upstream template
# namespace (amirpourmand/al-folio) and must be updated to this repository's
# own namespace before the first real use.

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    if: github.repository_owner == 'OzgenOzan'
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ${{ github.workspace }}

    steps:
      - name: Checkout
        uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4

      - name: Login
        uses: docker/login-action@c94ce9fb468520275223c153574b00df6fe4bcc9 # v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: update docker-compose
        shell: bash
        run: |
          sed -i "s|\.:|${{ github.workspace }}:|g" ${{ github.workspace }}/docker-compose.yml
          cat ${{ github.workspace }}/docker-compose.yml

      - uses: kitabisa/docker-slim-action@e641d62304259303c8557c27e10965f7348c7eb4 # v1.1.1
        env:
          DSLIM_PULL: true
          DSLIM_COMPOSE_FILE: ${{ github.workspace }}/docker-compose.yml
          DSLIM_TARGET_COMPOSE_SVC: jekyll
          DSLIM_CONTINUE_AFTER: signal
        with:
          target: amirpourmand/al-folio
          tag: "slim"

      # Push to the registry
      - run: docker image push amirpourmand/al-folio:slim
```

---

## File: `.github/workflows/deploy-docker-tag.yml`

Automatic tag-push trigger disabled (manual dispatch only); image namespace
flagged as upstream. Actions SHA-pinned (V2-2) and read-only default
permissions added (V2-4).

```yaml
name: Docker Image CI (Upload Tag)

# NOTE(remediation): automatic tag-push trigger disabled; manual dispatch
# only. Image names below still point to the upstream template namespace
# (amirpourmand/al-folio) and must be updated to this repository's own
# namespace before the first real use.

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@c7c53464625b32c7a7e944ae62b3e17d2b600130 # v3

      - name: Buildx
        uses: docker/setup-buildx-action@8d2750c68a42422c14e847fe6c8ac0403b4cbd6f # v3

      - name: Docker meta
        id: meta
        uses: docker/metadata-action@c299e40c65443455700f0fdfc63efafe5b349051 # v5
        with:
          images: amirpourmand/al-folio

      - name: Login
        uses: docker/login-action@c94ce9fb468520275223c153574b00df6fe4bcc9 # v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@ca052bb54ab0790a636c9b5f226502c73d547a25 # v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64/v8
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

---

## File: `.github/workflows/prettier.yml`

Fixes V2-4 (no permissions block) with a read-only top-level default; actions
SHA-pinned (V2-2). Behaviour otherwise unchanged.

```yaml
name: Prettier code formatter

on:
  pull_request:
    branches:
      - master
      - main
  push:
    branches:
      - master
      - main

permissions:
  contents: read

jobs:
  check:
    # available images: https://github.com/actions/runner-images#available-images
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4

      - name: Install dependencies
        run: npm ci

      - name: Collect changed files
        shell: bash
        run: |
          if [[ "${{ github.event_name }}" == "pull_request" ]]; then
            base="${{ github.event.pull_request.base.sha }}"
            head="${{ github.sha }}"
          else
            base="${{ github.event.before }}"
            head="${{ github.sha }}"
          fi

          if [[ -z "$base" || "$base" =~ ^0+$ ]]; then
            base="HEAD~1"
          fi

          git diff --name-only --diff-filter=ACMRT "$base" "$head" > changed_files.txt

      - name: Prettier Check
        id: prettier
        shell: bash
        run: |
          if [[ ! -s changed_files.txt ]]; then
            echo "No changed files to format."
            exit 0
          fi

          mapfile -t files < changed_files.txt
          npx prettier --check --ignore-unknown "${files[@]}"

      - name: Create diff
        # https://docs.github.com/en/actions/learn-github-actions/expressions#failure
        if: ${{ failure() }}
        shell: bash
        run: |
          if [[ -s changed_files.txt ]]; then
            mapfile -t files < changed_files.txt
            npx prettier --write --ignore-unknown "${files[@]}"
            git diff -- "${files[@]}" > diff.txt
          else
            touch diff.txt
          fi
          npm install -g diff2html-cli
          diff2html -i file -s side -F diff.html -- diff.txt

      - name: Upload html diff
        id: artifact-upload
        if: ${{ failure() && steps.prettier.conclusion == 'failure' }}
        uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4
        with:
          name: HTML Diff
          path: diff.html
          retention-days: 7

      - name: Dispatch information to repository
        if: ${{ failure() && steps.prettier.conclusion == 'failure' && github.event_name == 'pull_request' }}
        uses: peter-evans/repository-dispatch@bf47d102fdb849e755b0b0023ea3e81a44b6f570 # v2
        with:
          event-type: prettier-failed-on-pr
          client-payload: '{"pr_number": "${{ github.event.number }}", "artifact_url": "${{ steps.artifact-upload.outputs.artifact-url }}", "run_id": "${{ github.run_id }}"}'
```

---

## File: `.github/workflows/broken-links.yml`

Fixes V2-4 (no permissions block) with a read-only top-level default; actions
SHA-pinned (V2-2). Behaviour otherwise unchanged.

```yaml
name: Check for broken links

on:
  push:
    branches:
      - master
      - main
    paths:
      - "assets/**"
      - "**.html"
      - "**.js"
      - "**.liquid"
      - "**/*.md"
      - "**.yml"
      - "!.github/workflows/axe.yml"
      - "!.github/workflows/deploy-docker-tag.yml"
      - "!.github/workflows/deploy-image.yml"
      - "!.github/workflows/docker-slim.yml"
      - "!.github/workflows/lighthouse-badger.yml"
      - "!.github/workflows/prettier.yml"
      - "!lighthouse_results/**"
  pull_request:
    branches:
      - master
      - main
    paths:
      - "assets/**"
      - "**.html"
      - "**.js"
      - "**.liquid"
      - "**/*.md"
      - "**.yml"
      - "!.github/workflows/axe.yml"
      - "!.github/workflows/deploy-docker-tag.yml"
      - "!.github/workflows/deploy-image.yml"
      - "!.github/workflows/docker-slim.yml"
      - "!.github/workflows/lighthouse-badger.yml"
      - "!.github/workflows/prettier.yml"
      - "!lighthouse_results/**"

permissions:
  contents: read

jobs:
  link-checker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
        with:
          fetch-depth: 0

      - name: Collect changed Markdown and HTML files
        id: link-files
        shell: bash
        run: |
          if [[ "${{ github.event_name }}" == "pull_request" ]]; then
            base="${{ github.event.pull_request.base.sha }}"
            head="${{ github.sha }}"
          else
            base="${{ github.event.before }}"
            head="${{ github.sha }}"
          fi

          if [[ -z "$base" || "$base" =~ ^0+$ ]]; then
            base="HEAD~1"
          fi

          mapfile -t files < <(
            git diff --name-only --diff-filter=ACMRT "$base" "$head" -- '*.md' '*.html' \
              | grep -Ev '^(README\.md|_pages/404\.md|_pages/blog\.md|_posts/2018-12-22-distill\.md|_posts/2023-04-24-videos\.md)$' \
              || true
          )

          if [[ ${#files[@]} -eq 0 ]]; then
            echo "has_files=false" >> "$GITHUB_OUTPUT"
            echo "No changed Markdown or HTML files to check."
            exit 0
          fi

          if ! grep -E -q '(https?://|\]\(|href=)' "${files[@]}"; then
            echo "has_files=false" >> "$GITHUB_OUTPUT"
            echo "No links found in changed Markdown or HTML files."
            exit 0
          fi

          printf '%s\n' "${files[@]}"
          echo "has_files=true" >> "$GITHUB_OUTPUT"
          echo "files=${files[*]}" >> "$GITHUB_OUTPUT"

      - name: Link Checker
        if: steps.link-files.outputs.has_files == 'true'
        uses: lycheeverse/lychee-action@f81112d0d2814ded911bd23e3beaa9dda9093915 # v2.1.0
        with:
          fail: true
          # removed md files that include liquid tags
          args: --user-agent 'curl/7.54' --exclude-path README.md --exclude-path _pages/404.md --exclude-path _pages/blog.md --exclude-path _posts/2018-12-22-distill.md --exclude-path _posts/2023-04-24-videos.md --verbose --no-progress ${{ steps.link-files.outputs.files }}
```

---

## File: `.github/workflows/broken-links-site.yml`

Fixes V2-4 (no permissions block) with a read-only top-level default; actions
SHA-pinned (V2-2). Behaviour otherwise unchanged.

```yaml
name: Check for broken links on site

on:
  workflow_run:
    workflows: [Deploy site]
    types: [completed]

permissions:
  contents: read

jobs:
  check-links-on-site:
    # https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#running-a-workflow-based-on-the-conclusion-of-another-workflow
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    # available images: https://github.com/actions/runner-images#available-images
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
      - name: Setup Ruby
        uses: ruby/setup-ruby@14594264cd68ce8a2345dd349bc3d138a4ef85c8 # v1
        with:
          ruby-version: "3.2.2"
          bundler-cache: true
      - name: Update _config.yml ⚙️
        uses: fjogeleit/yaml-update-action@dffe9a5223d84653c13374032382f6bb5de8e5ef # main (floating branch pinned at remediation time)
        with:
          commitChange: false
          valueFile: "_config.yml"
          changes: |
            {
              "giscus.repo": "${{ github.repository }}",
              "baseurl": ""
            }
      - name: Install and Build 🔧
        run: |
          sudo apt-get update && sudo apt-get install -y imagemagick
          pip3 install --upgrade jupyter
          export JEKYLL_ENV=production
          bundle exec jekyll build
      - name: Purge unused CSS 🧹
        run: |
          npm install -g purgecss
          purgecss -c purgecss.config.js
      - name: Link Checker 🔗
        uses: lycheeverse/lychee-action@22134d37a1fff6c2974df9c92a7c7e1e86a08f9c # v1.9.0
        with:
          fail: true
          # only check local links
          args: --offline --remap '_site(/?.*)/assets/(.*) _site/assets/$2' --verbose --no-progress '_site/**/*.html'
```

---

## File: `.github/workflows/axe.yml`

Fixes V2-4 (no permissions block) with a read-only top-level default; actions
SHA-pinned (V2-2). Behaviour otherwise unchanged.

```yaml
name: Axe accessibility testing

on:
  # if you want to run this on every push uncomment the following lines
  # push:
  #   branches:
  #     - master
  #     - main
  # pull_request:
  #   branches:
  #     - master
  #     - main
  workflow_dispatch:
    inputs:
      url:
        description: "URL to be checked (e.g.: blog/)"
        required: false

permissions:
  contents: read

env:
  URL: ""

jobs:
  check:
    # available images: https://github.com/actions/runner-images#available-images
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
      - name: Setup Ruby
        uses: ruby/setup-ruby@14594264cd68ce8a2345dd349bc3d138a4ef85c8 # v1
        with:
          ruby-version: "3.2.2"
          bundler-cache: true
      - name: Update _config.yml ⚙️
        uses: fjogeleit/yaml-update-action@dffe9a5223d84653c13374032382f6bb5de8e5ef # main (floating branch pinned at remediation time)
        with:
          commitChange: false
          valueFile: "_config.yml"
          changes: |
            {
              "giscus.repo": "${{ github.repository }}",
              "baseurl": ""
            }
      - name: Install and Build 🔧
        run: |
          sudo apt-get update && sudo apt-get install -y imagemagick
          pip3 install --upgrade jupyter
          export JEKYLL_ENV=production
          bundle exec jekyll build
      - name: Purge unused CSS 🧹
        run: |
          npm install -g purgecss
          purgecss -c purgecss.config.js
      - name: Get Chromium version 🌐
        # https://github.com/GoogleChromeLabs/chrome-for-testing?tab=readme-ov-file#other-api-endpoints
        run: |
          CHROMIUM_VERSION=$(wget -qO- https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_STABLE | cut -d. -f1)
          echo "Chromium version: $CHROMIUM_VERSION"
          echo "CHROMIUM_VERSION=$CHROMIUM_VERSION" >> $GITHUB_ENV
      - name: Setup Chrome 🌐
        id: setup-chrome
        uses: browser-actions/setup-chrome@c785b87e244131f27c9f19c1a33e2ead956ab7ce # v1
        with:
          chrome-version: ${{ env.CHROMIUM_VERSION }}
      - name: Install chromedriver 🚗
        run: |
          npm install -g chromedriver@$CHROMIUM_VERSION
      - name: Run axe 🪓
        # https://github.com/dequelabs/axe-core-npm/tree/develop/packages/cli
        run: |
          npm install -g @axe-core/cli
          npm install -g http-server
          http-server _site/ &
          axe --chromedriver-path $(npm root -g)/chromedriver/bin/chromedriver http://localhost:8080/${{ github.event.inputs.url || env.URL }} --load-delay=1500 --exit
```

---

## File: `.github/workflows/prettier-html.yml`

Fixes V2-4 (no permissions block). This job pushes formatted HTML back to the
`gh-pages` branch, so the top-level default is read-only and only the
`format` job escalates to `contents: write`. Actions SHA-pinned (V2-2).

```yaml
name: Prettify gh-pages

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  format:
    # Pushes formatted HTML back to the gh-pages branch, so only this job
    # escalates to contents: write.
    permissions:
      contents: write
    runs-on: ubuntu-latest
    steps:
      - name: Checkout gh-pages branch
        uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
        with:
          ref: gh-pages

      - name: Find and Remove </source> Tags
        run: find . -type f -name "*.html" -exec sed -i 's/<\/source>//g' {} +

      - name: Set up Node.js
        uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4

      - name: Install Prettier
        run: npm install -g prettier

      - name: Check for Prettier
        run: npx prettier --version || echo "Prettier not found"

      - name: Run Prettier on HTML files
        run: npx prettier --write '**/*.html'

      - name: Commit and push changes
        run: |
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "Formatted HTML files" || echo "No changes to commit"
          git push
```

---

## File: `.github/workflows/prettier-comment-on-pr.yml`

Fixes V2-4 (no permissions block). The job only comments on pull requests, so
it gets `pull-requests: write` plus `contents: read` scoped to the job, with a
read-only top-level default. Action SHA-pinned (V2-2).

```yaml
name: Comment on pull request

on:
  repository_dispatch:
    types: [prettier-failed-on-pr]

permissions:
  contents: read

jobs:
  comment:
    # Posts a comment on the failing PR, so this job (and only this job)
    # needs pull-requests: write in addition to contents: read.
    permissions:
      pull-requests: write
      contents: read
    # available images: https://github.com/actions/runner-images#available-images
    runs-on: ubuntu-latest
    steps:
      - name: PR comment with html diff 💬
        uses: thollander/actions-comment-pull-request@fabd468d3a1a0b97feee5f6b9e499eab0dd903f6 # v2
        with:
          comment_tag: prettier-failed
          pr_number: ${{ github.event.client_payload.pr_number }}
          message: |
            Failed [prettier code check](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.event.client_payload.run_id }}). Check [this file](${{ github.event.client_payload.artifact_url }}) for more information.
```

---

## Files intentionally NOT changed

- `.github/workflows/codeql.yml` — already has a correctly scoped job-level
  `permissions:` block. Its actions are still tag-pinned (`@v4`, `@v3`);
  pinning them is recommended as follow-up but is out of scope here.
- `.github/workflows/schedule-posts.txt` — not a workflow file.

## `.github/dependabot.yml` (already applied on this branch)

Weekly updates for the `github-actions` and `bundler` ecosystems were added
directly to this branch (the only change the current token could write).
