const categories = [
  ["01","Production of the Year","KSh 50.00 per vote"],
  ["02","Upcoming Production of the Year","KSh 50.00 per vote"],
  ["03","Producer of the Year","KSh 20.00 per vote"],
  ["04","Director of the Year","KSh 20.00 per vote"],
  ["05","Actor of the Year","KSh 10.00 per vote"],
  ["06","Actress of the Year","KSh 10.00 per vote"]
];
const root = document.getElementById("categories");
root.innerHTML = categories.map(([number,name,price]) => `
  <article class="category">
    <span class="number">${number} / CATEGORY</span>
    <h3>${name}</h3>
    <span class="price">${price}</span>
  </article>
`).join("");
