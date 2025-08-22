import React from "react";
import PopularStores from "./PopularStores";
import { usePopularStores } from "../hooks/usePopularStores";
import type { PopularStoresProvider } from "../services/popularStores";

type Props = Omit<React.ComponentProps<typeof PopularStores>, "items"> & {
  provider?: PopularStoresProvider; // override provider เฉพาะหน้าได้
};

export default function PopularStoresContainer(props: Props) {
  const { data, loading, error } = usePopularStores({ provider: props.provider });

  if (loading) {
    return (
      <section className="ps">
        <div className="ps-title">{props.title ?? "ร้านยอดนิยม"}</div>
        <div className="ps-scroll">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ps-card ps-skeleton" />
          ))}
        </div>
      </section>
    );
  }
  if (error) {
    return <div style={{ color: "crimson" }}>โหลดร้านยอดนิยมไม่สำเร็จ</div>;
  }

  return <PopularStores {...props} items={data} />;
}
