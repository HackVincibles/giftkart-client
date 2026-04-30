"use client";

import { useSliderWithInput } from "@/hooks/use-slider-with-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useId, useEffect } from "react";

export function PriceSlider({ items, onValueChange, initialRange = [1000, 50000] }) {
  const id = useId();

  const tick_count = 40;
  const minValue = 0;
  const maxValue = 100000;

  const {
    sliderValue,
    inputValues,
    validateAndUpdateValue,
    handleInputChange,
    handleSliderChange,
  } = useSliderWithInput({ minValue, maxValue, initialValue: initialRange });

  useEffect(() => {
    onValueChange(sliderValue);
  }, [sliderValue, onValueChange]);

  const priceStep = (maxValue - minValue) / tick_count;

  const itemCounts = Array(tick_count)
    .fill(0)
    .map((_, tick) => {
      const rangeMin = minValue + tick * priceStep;
      const rangeMax = minValue + (tick + 1) * priceStep;
      return items.filter((item) => item.basePrice >= rangeMin && item.basePrice < rangeMax).length;
    });

  const maxCount = Math.max(...itemCounts);

  const handleSliderValueChange = (values: number[]) => {
    handleSliderChange(values);
  };

  const isBarInSelectedRange = (
    index: number,
    minValue: number,
    priceStep: number,
    sliderValue: number[],
  ) => {
    const rangeMin = minValue + index * priceStep;
    const rangeMax = minValue + (index + 1) * priceStep;
    return (
      rangeMin <= sliderValue[1] &&
      rangeMax >= sliderValue[0]
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-8 w-full">
        {/* Slider Section */}
        <div className="flex-1">
          <div className="flex h-10 w-full items-end px-2 mb-2" aria-hidden="true">
            {itemCounts.map((count, i) => (
              <div
                key={i}
                className="flex flex-1 justify-center"
                style={{
                  height: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%`,
                }}
              >
                <span
                  data-selected={isBarInSelectedRange(i, minValue, priceStep, sliderValue)}
                  className="h-full w-full bg-primary/10 data-[selected=true]:bg-primary transition-colors duration-200"
                ></span>
              </div>
            ))}
          </div>
          <Slider
            value={sliderValue}
            onValueChange={handleSliderValueChange}
            min={minValue}
            max={maxValue}
            step={500}
            aria-label="Price range"
          />
        </div>

        {/* Input Boxes Section */}
        <div className="flex items-center gap-3 shrink-0 pt-6">
          <div className="space-y-1.5 w-32">
            <Label htmlFor={`${id}-min`} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Min Price</Label>
            <div className="relative">
              <Input
                id={`${id}-min`}
                className="peer w-full ps-6 h-9 text-sm bg-transparent border-input font-bold"
                type="text"
                inputMode="decimal"
                value={inputValues[0]}
                onChange={(e) => handleInputChange(e, 0)}
                onBlur={() => validateAndUpdateValue(inputValues[0], 0)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    validateAndUpdateValue(inputValues[0], 0);
                  }
                }}
              />
              <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2.5 text-xs text-muted-foreground font-bold">₹</span>
            </div>
          </div>

          <div className="h-4 w-2 border-b border-muted-foreground/30 self-center mt-6"></div>

          <div className="space-y-1.5 w-32">
            <Label htmlFor={`${id}-max`} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Max Price</Label>
            <div className="relative">
              <Input
                id={`${id}-max`}
                className="peer w-full ps-6 h-9 text-sm bg-transparent border-input font-bold"
                type="text"
                inputMode="decimal"
                value={inputValues[1]}
                onChange={(e) => handleInputChange(e, 1)}
                onBlur={() => validateAndUpdateValue(inputValues[1], 1)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    validateAndUpdateValue(inputValues[1], 1);
                  }
                }}
              />
              <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2.5 text-xs text-muted-foreground font-bold">₹</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
