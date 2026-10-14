import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  q: string;
  a: ReactNode;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) =>
    setOpenIndex((current) => (current === index ? null : index));

  return (
    <ul className="divide-y divide-border">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <li key={item.q}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
            >
              <span className="text-sm font-medium">{item.q}</span>
              <ChevronDown
                aria-hidden="true"
                className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </button>
            <motion.div
              initial={false}
              animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="pb-3.5 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </div>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}