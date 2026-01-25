import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BillingFrequency, IBillingFrequency } from '@/constants/billing-frequency';

interface Props {
  frequency: IBillingFrequency;
  setFrequency: (frequency: IBillingFrequency) => void;
}

export function Toggle({ setFrequency, frequency }: Props) {
  return (
    <div className="flex justify-center mb-8">
      <Tabs
        value={frequency.value}
        onValueChange={(value) => {
          const billingFrequency = BillingFrequency.find((bf) => value === bf.value);
          if (billingFrequency) {
            setFrequency(billingFrequency);
          }
        }}
      >
        <TabsList>
          {BillingFrequency.map((billingFrequency) => (
            <TabsTrigger key={billingFrequency.value} value={billingFrequency.value}>
              {billingFrequency.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
