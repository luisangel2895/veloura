interface PriceProps {
  amountCents: number;
  className?: string;
}

export function Price({ amountCents, className }: PriceProps) {
  return (
    <span className={className}>
      {new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amountCents / 100)}
    </span>
  );
}
