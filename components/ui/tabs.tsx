"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex w-fit items-center justify-start border-b border-gray-200 dark:border-gray-700 p-0",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Добавен преход (transition)
        "transition-all duration-200",
        // Дефолтен цвят (неактивен)
        "text-foreground/70 dark:text-muted-foreground/70",
        // Общи стилове
        "inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium",
        // Стилизиране при активен таб
        "border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary",
        // Hover ефект
        "hover:text-primary/80 dark:hover:text-primary/80",
        // Focus/Disabled
        "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none mt-2", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

// "use client";

// import * as React from "react";
// import * as TabsPrimitive from "@radix-ui/react-tabs";

// // Mock implementation of cn (clsx/tailwind-merge) for demonstration purposes
// // In a real project, you would use the actual utility from "@/lib/utils"
// const cn = (...classes: (string | undefined)[]) =>
//   classes.filter(Boolean).join(" ");

// function Tabs({
//   className,
//   ...props
// }: React.ComponentProps<typeof TabsPrimitive.Root>) {
//   return (
//     <TabsPrimitive.Root
//       data-slot="tabs"
//       className={cn("flex flex-col gap-2", className)}
//       {...props}
//     />
//   );
// }

// function TabsList({
//   className,
//   ...props
// }: React.ComponentProps<typeof TabsPrimitive.List>) {
//   return (
//     <TabsPrimitive.List
//       data-slot="tabs-list"
//       className={cn(
//         // Премахнахме долната граница от List, за да не се дублира с линията на Trigger-ите,
//         // но оставих старата ви имплементация, за да запазим визуалния контекст, ако е нужен.
//         "inline-flex w-fit items-center justify-start border-b border-gray-200 dark:border-gray-700 p-0",
//         className
//       )}
//       {...props}
//     />
//   );
// }

// function TabsTrigger({
//   className,
//   ...props
// }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
//   return (
//     <TabsPrimitive.Trigger
//       data-slot="tabs-trigger"
//       className={cn(
//         // Добавен преход (transition)
//         "transition-all duration-200",
//         // Дефолтен цвят (неактивен)
//         "text-foreground/70 dark:text-muted-foreground/70",
//         // Общи стилове
//         "inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium",

//         // --- Ключови промени за Progressive Line ---

//         // 1. Позициониране: 'relative' прави таба контейнер за псевдо-елемента ::after
//         "relative",

//         "after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-primary after:w-0",

//         // 3. Анимация: Transition само на свойството 'width'
//         "after:transition-[width] after:duration-300 after:ease-out",

//         // 4. Активно състояние: data-[state=active]:after:w-full - Разпъва линията на 100% ширина
//         "data-[state=active]:text-primary data-[state=active]:after:w-full",

//         // Премахнат е старият border-b-2: "border-b-2 border-transparent data-[state=active]:border-primary"

//         // Hover ефект
//         "hover:text-primary/80 dark:hover:text-primary/80",
//         // Focus/Disabled
//         "focus-visible:ring-ring/50 focus-visible:ring-[1px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
//         className
//       )}
//       {...props}
//     />
//   );
// }

// function TabsContent({
//   className,
//   ...props
// }: React.ComponentProps<typeof TabsPrimitive.Content>) {
//   return (
//     <TabsPrimitive.Content
//       data-slot="tabs-content"
//       className={cn("flex-1 outline-none mt-2", className)}
//       {...props}
//     />
//   );
// }

// export { Tabs, TabsList, TabsTrigger, TabsContent };
