import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import type { MortgageCalculation } from "@/lib/types";

interface MortgageCalculatorProps {
  propertyPrice?: number;
}

export default function MortgageCalculator({ propertyPrice }: MortgageCalculatorProps) {
  const [homePrice, setHomePrice] = useState(propertyPrice || 500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [calculation, setCalculation] = useState<MortgageCalculation | null>(null);

  const calculateMortgage = () => {
    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    if (loanAmount <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) {
      setCalculation(null);
      return;
    }

    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    setCalculation({
      loanAmount,
      interestRate,
      loanTerm,
      monthlyPayment,
      totalInterest,
      totalPayment,
    });
  };

  useEffect(() => {
    calculateMortgage();
  }, [homePrice, downPayment, interestRate, loanTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const downPaymentPercentage = ((downPayment / homePrice) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="w-5 h-5" />
          <span>Mortgage Calculator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="homePrice">Home Price</Label>
            <Input
              id="homePrice"
              type="number"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
              placeholder="500,000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="downPayment">
              Down Payment ({downPaymentPercentage}%)
            </Label>
            <Input
              id="downPayment"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              placeholder="100,000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              placeholder="6.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanTerm">Loan Term (years)</Label>
            <Input
              id="loanTerm"
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              placeholder="30"
            />
          </div>
        </div>

        {/* Results */}
        {calculation && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">
                  Monthly Payment
                </h4>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(calculation.monthlyPayment)}
                </p>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">
                  Loan Amount
                </h4>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(calculation.loanAmount)}
                </p>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">
                  Total Interest
                </h4>
                <p className="text-xl font-semibold text-orange-600">
                  {formatCurrency(calculation.totalInterest)}
                </p>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">
                  Total Payment
                </h4>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(calculation.totalPayment)}
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">
                Payment Breakdown
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Principal & Interest:</span>
                  <span className="font-medium">
                    {formatCurrency(calculation.monthlyPayment)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Tax (est.):</span>
                  <span className="font-medium">
                    {formatCurrency((homePrice * 0.012) / 12)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Home Insurance (est.):</span>
                  <span className="font-medium">
                    {formatCurrency((homePrice * 0.003) / 12)}
                  </span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total Monthly Payment (est.):</span>
                  <span>
                    {formatCurrency(
                      calculation.monthlyPayment +
                        (homePrice * 0.012) / 12 +
                        (homePrice * 0.003) / 12
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={calculateMortgage}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Recalculate
        </Button>
      </CardContent>
    </Card>
  );
}
