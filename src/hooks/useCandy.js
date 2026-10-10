import { useState } from "react";
import CandyItems from "../data/candy.json";

export function useCandy() {
  const [candy] = useState(CandyItems);
  return { candy };
}