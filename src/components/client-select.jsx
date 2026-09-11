"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ClientSelect({ clients, name = "client_id", required, defaultValue }) {
  return (
    <Select name={name} required={required} defaultValue={defaultValue}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a client">
          {(value) => clients.find((c) => c.id === value)?.company_name ?? "Select a client"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            {client.company_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
