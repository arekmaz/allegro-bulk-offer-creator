import api from "../base";

export default async function createOffers(offers) {
  console.log({ offs: offers });
  return await api.post("/offers", {
    offers
  });
}
