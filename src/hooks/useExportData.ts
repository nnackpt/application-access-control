import * as XLSX from 'xlsx';
import getValue from "@/Utils/getValue";
import toast from 'react-hot-toast';

interface ColumnConfig<T> {
    header: string;
    keys?: string[];
    formatter?: (item: T) => string; 
}

interface ExportConfig<T> {
    fileName: string
    sheetName: string
    data: T[]
    columns: ColumnConfig<T>[]
}

export const useExportData = <T extends object>() => {
    const exportToExcel = ({ fileName, sheetName, data, columns }: ExportConfig<T>) => {
        try {
            if (data.length === 0) {
                alert("No data to export");
                return;
            }

            const exportData = data.map(item => {
                const row: Record<string, string> = {};
                columns.forEach(col => {
                    // Use formatter if available, otherwise use getValue with keys
                    row[col.header] = col.formatter
                        ? col.formatter(item)
                        : (col.keys ? getValue(item, col.keys) : '') || '';
                });
                return row;
            });

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`);
        } catch (error) {
            console.error("Error exporting data:", error);
            alert("Failed to export data. Please try again.");
        }
    };

    return { exportToExcel };
};