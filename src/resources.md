---
layout: "layouts/home.njk"
title: "Resources"
description: ""
---

<style>
table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #dddddd;
}
</style>

<table>
<tbody>
{% for resourceGroup, resource in resources %}
  <tr>

  <td>{{resourceGroup}}</td>
  <td>
{% for Link in resource %}
<a href="{{Link.link}}">{{Link.text}}</a><br/>

{% endfor %}
</td>
</tr>
{% endfor %}
</tbody>
</table>

