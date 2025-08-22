import rice    from "../assets/Categories/RiceDishes.svg";
import noodle  from "../assets/Categories/Noodles.svg";
import coffee  from "../assets/Categories/CoffeeTea.svg";
import fast    from "../assets/Categories/FastFood.svg";
import healthy from "../assets/Categories/Healthy.svg";
import bubble  from "../assets/Categories/BubbleTea.svg";
import bakery  from "../assets/Categories/Bakery.svg";

export const categoriesMock = [
  { id: "rice",    name: "Rice Dishes",  icon: rice,    href: "/category/rice" },
  { id: "noodle",  name: "Noodles",      icon: noodle,  href: "/category/noodle" },
  { id: "coffee",  name: "Coffee & Tea", icon: coffee,  href: "/category/coffee-tea" },
  { id: "fast",    name: "Fast Food",    icon: fast,    href: "/category/fast-food" },
  { id: "healthy", name: "Healthy",      icon: healthy, href: "/category/healthy" },
  { id: "bubble",  name: "Bubble Tea",   icon: bubble,  href: "/category/bubble-tea" },
  { id: "bakery",  name: "Bakery",       icon: bakery,  href: "/category/bakery" }
];
