// src/components/ui/sidebar.tsx
"use client";

import * as React from "react"
import { cn } from "~/lib/utils"

const SidebarContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

function Sidebar({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  const [open, setOpen] = React.useState(false)

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div
        className={cn(
          "flex h-full flex-col bg-background border-l",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

function SidebarHeader({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function SidebarContent({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-1 px-3", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function SidebarMenu({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn("flex flex-col space-y-1", className)}
      {...props}
    >
      {children}
    </ul>
  )
}

function SidebarMenuItem({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={cn("", className)}
      {...props}
    >
      {children}
    </li>
  )
}

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
}