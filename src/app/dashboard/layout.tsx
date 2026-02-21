import Dashboard from "@/components/dashboard/dashboard-layout";

export default function Page({ children }: { children: React.ReactNode }) {
return (<Dashboard>
    {children}
</Dashboard>);
}