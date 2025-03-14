---
layout: post
title: Adding References to Blog Posts
date: 2023-07-12
description: How to include citations and references in your pharmaceutical research posts
tags: research publications citations
categories: guides
giscus_comments: true
related_posts: false
related_publications: true
---

This post demonstrates how to add bibliography to scientific blog posts. We support various citation styles through [jekyll-scholar](https://github.com/inukshuk/jekyll-scholar).

For example, you can cite your publications:
{% cite ozgen2024anticancer %}

Or multiple citations together:
{% cite ozgen2024anticancer ozgen2023enzymatic %}

You can also include detailed references:
{% reference ozgen2023pharmacokinetic %}

The bibliography will be automatically generated at the end of the post based on your citations.

If you would like something more academic, check the [distill style post]({% post_url 2018-12-22-distill %}).
