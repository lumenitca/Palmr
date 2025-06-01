import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

export interface FileSizeInputProps {
  value: string; // valor em bytes
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: any;
}

type Unit = "MB" | "GB" | "TB";

const UNIT_MULTIPLIERS: Record<Unit, number> = {
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024,
};

function bytesToHumanReadable(bytes: string): { value: string; unit: Unit } {
  const numBytes = parseInt(bytes, 10);

  // Se for 0 ou inválido, retorna 0 GB
  if (!numBytes || numBytes <= 0) {
    return { value: "0", unit: "GB" };
  }

  // Verifica TB (com tolerância para valores próximos)
  if (numBytes >= UNIT_MULTIPLIERS.TB) {
    const tbValue = numBytes / UNIT_MULTIPLIERS.TB;
    if (tbValue === Math.floor(tbValue)) {
      return {
        value: tbValue.toString(),
        unit: "TB",
      };
    }
  }

  // Verifica GB (com tolerância para valores próximos)
  if (numBytes >= UNIT_MULTIPLIERS.GB) {
    const gbValue = numBytes / UNIT_MULTIPLIERS.GB;
    if (gbValue === Math.floor(gbValue)) {
      return {
        value: gbValue.toString(),
        unit: "GB",
      };
    }
  }

  // Verifica MB
  if (numBytes >= UNIT_MULTIPLIERS.MB) {
    const mbValue = numBytes / UNIT_MULTIPLIERS.MB;
    return {
      value: mbValue === Math.floor(mbValue) ? mbValue.toString() : mbValue.toFixed(2),
      unit: "MB",
    };
  }

  // Para valores menores que 1MB, converte para MB com decimais
  const mbValue = numBytes / UNIT_MULTIPLIERS.MB;
  return {
    value: mbValue.toFixed(3),
    unit: "MB",
  };
}

function humanReadableToBytes(value: string, unit: Unit): string {
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue <= 0) {
    return "0";
  }

  return Math.floor(numValue * UNIT_MULTIPLIERS[unit]).toString();
}

export function FileSizeInput({ value, onChange, disabled = false, error }: FileSizeInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<Unit>("GB");

  // Inicializar os valores quando o componente monta ou o value muda
  useEffect(() => {
    if (value && value !== "0") {
      const { value: humanValue, unit } = bytesToHumanReadable(value);
      setDisplayValue(humanValue);
      setSelectedUnit(unit);
    } else {
      setDisplayValue("");
      setSelectedUnit("GB");
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    // Só permitir números e ponto decimal
    const sanitizedValue = newValue.replace(/[^0-9.]/g, "");

    // Prevenir múltiplos pontos decimais
    const parts = sanitizedValue.split(".");
    const finalValue = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitizedValue;

    setDisplayValue(finalValue);

    if (finalValue === "" || finalValue === "0") {
      onChange("0");
    } else {
      const bytesValue = humanReadableToBytes(finalValue, selectedUnit);
      onChange(bytesValue);
    }
  };

  const handleUnitChange = (newUnit: Unit) => {
    setSelectedUnit(newUnit);

    if (displayValue && displayValue !== "0") {
      const bytesValue = humanReadableToBytes(displayValue, newUnit);
      onChange(bytesValue);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={displayValue}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder="0"
        className="flex-1"
        disabled={disabled}
        aria-invalid={!!error}
      />
      <select
        value={selectedUnit}
        onChange={(e) => handleUnitChange(e.target.value as Unit)}
        className="w-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        disabled={disabled}
      >
        <option value="MB">MB</option>
        <option value="GB">GB</option>
        <option value="TB">TB</option>
      </select>
    </div>
  );
}
