const dotenv = require('dotenv').config()
let now = new Date();

module.exports = {
    environment: process.env.ELEVENTY_ENV,
    menu: [
        {
            link: "/chart",
            text: "Chart",
        },
        {
            link: "https://github.com/jacebenson/sndocs/",
            text: "SNDocs on GitHub",
        }
    ],
    twitter: "jacebenson",
    github: "https://github.com/jacebenson/sndocs",
    linkedin: "https://linkedin.com/in/jacebenson",
    baseURL: "https://sndocs.jace.pro",
    title: "Unofficial ServiceNow Version Tracker",
    patreon: {
        footerMessage: "Become a Patron and you'll get access to my posts in progress, polls, thoughts and other things I want to share.  A monthly happy hour with me and access to my PDI.",
        link: "https://www.patreon.com/bePatron?u=23597006",
        text: "Become a Patron!",
        active: true
    },
    search: false,
    description: "An 11ty Starter for your site featuring RSS, Search, and Comments",
    subtitle: "This is a subtitle about your amazing 11ty site.",
    author: "Jace Benson",//used all over
    email: "jace.benson@gmail.com",//used specificly for rss feed
    utterancesRepo: "jacebenson/jace-ty",//used for comments//if commented, doesnt load
    lastBuildDate: now.toLocaleString('en-CA',{hour12:false, timeZone: 'America/Chicago'}).replace(',',''),
    lastBuildYear: now.getFullYear(),
}