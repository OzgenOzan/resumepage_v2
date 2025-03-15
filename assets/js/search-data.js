// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-cv",
          title: "cv",
          description: "Clinical Research Professional with expertise in pharmaceutical development and bioequivalence studies.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/resumepage/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "Research and development initiatives in pharmaceutical sciences",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-publications",
          title: "publications",
          description: "Research publications and academic contributions in pharmaceutical science, biotechnology, and clinical research.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-repositories",
          title: "repositories",
          description: "Coding projects and open source contributions",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-expertise",
          title: "expertise",
          description: "Professional development",
          section: "Navigation",
          handler: () => {
            window.location.href = "/expertise/";
          },
        },{id: "nav-blog",
          title: "blog",
          description: "Insights on pharmaceutical research, clinical trials, and healthcare innovation",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "dropdown-expertise",
              title: "expertise",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
              },
            },{id: "dropdown-collaborators",
              title: "collaborators",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
              },
            },{id: "dropdown-repositories",
              title: "repositories",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
              },
            },{id: "dropdown-publications",
              title: "publications",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "";
              },
            },{id: "dropdown-blog",
              title: "blog",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/blog/";
              },
            },{id: "post-machine-learning-applications-in-modern-drug-discovery",
      
        title: "Machine Learning Applications in Modern Drug Discovery",
      
      description: "Exploring how AI and machine learning are transforming pharmaceutical research and drug development processes",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2024/machine-learning-drug-discovery/";
        
      },
    },{id: "post-understanding-bioequivalence-studies-in-generic-drug-development",
      
        title: "Understanding Bioequivalence Studies in Generic Drug Development",
      
      description: "An overview of the importance of bioequivalence studies in pharmaceutical research and regulatory approval",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2024/bioequivalence-studies/";
        
      },
    },{id: "news-continuing-phd-research-in-gene-and-cell-therapy-at-akdeniz-university-focusing-on-novel-therapeutic-approaches",
          title: 'Continuing PhD research in Gene and Cell Therapy at Akdeniz University, focusing on...',
          description: "",
          section: "News",},{id: "news-successfully-implemented-digital-solutions-for-tracking-clinical-study-timelines-and-regulatory-applications-improving-process-efficiency",
          title: 'Successfully implemented digital solutions for tracking clinical study timelines and regulatory applications, improving...',
          description: "",
          section: "News",},{id: "news-published-research-on-anticancer-properties-of-antimicrobial-peptides-with-patent-pending-machine-learning-methodology",
          title: 'Published research on anticancer properties of antimicrobial peptides with patent-pending machine learning methodology....',
          description: "",
          section: "News",},{id: "projects-machine-learning-for-anticancer-peptides",
          title: 'Machine Learning for Anticancer Peptides',
          description: "A machine learning model developed for determining anticancer activity of peptides",
          section: "Projects",handler: () => {
              window.location.href = "/projects/anticancer_peptide_ml/";
            },},{id: "projects-clinical-research-automation",
          title: 'Clinical Research Automation',
          description: "Digital solutions for tracking study timelines and regulatory applications",
          section: "Projects",handler: () => {
              window.location.href = "/projects/automation_digitalization/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6F%7A%61%6E_%6F%7A%67%65%6E@%6F%75%74%6C%6F%6F%6B.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/OzgenOzan", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/719101", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0000-0002-1767-8057", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
        id: 'social-work',
        title: 'Work',
        section: 'Socials',
        handler: () => {
          window.open("https://www.nobel.com.tr/", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
