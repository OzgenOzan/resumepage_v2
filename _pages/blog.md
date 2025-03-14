---
layout: page
permalink: /blog/
title: Blog
description: Insights on pharmaceutical research, clinical trials, and healthcare innovation
nav: true
nav_order: 4
---

## Latest Posts

Here you'll find my thoughts and insights on:

- Clinical Research and Development
- Bioequivalence Studies
- Machine Learning in Drug Discovery
- Regulatory Affairs Updates
- Advanced Therapeutics
- Healthcare Technology Innovation

{% assign posts = site.posts | where_exp: "post", "post.sticky != true" %}
{% assign sorted_posts = posts | sort: "date" | reverse %}

<div class="post-list">
  {% for post in sorted_posts %}
    <div class="post-preview">
      <div class="post-title">{{ post.title }}</div>
      <div class="post-meta">
        {{ post.date | date: "%B %-d, %Y" }}
      </div>
      <div class="post-description">
        {{ post.description }}
      </div>
    </div>
  {% endfor %}
</div>
