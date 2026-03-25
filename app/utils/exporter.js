import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export const useReportExporter = () => {
    const brandColor = [212, 175, 55] // Red Velvet Gold

    const exportExcel = (data, fileName, type) => {
    // Dynamically flatten the data based on your item structure
        const worksheet = XLSX.utils.json_to_sheet(data.map((item) => {
            // Flattening logic based on report type
            if (type === 'invoice') {
                return {
                    Date: item.date,
                    Subtotal: item.subtotal,
                    Discount: item.discount,
                    Tax: item.tax,
                    Total: item['total-price'],
                    Cash: item.cash,
                    CreditCard: item['credit-card'],
                    DebitCard: item['debit-card'],
                    QRIS: item.qris,
                    Voucher: item.voucher,
                    Payment: item['total-payment']
                }
            } else if (type === 'stockcard') {
                return {
                    Date: item.date,
                    Description: item.description,
                    In: item.in,
                    Out: item.out,
                    Balance: item.balance
                }
            } else if (type === 'mutation') {
                return {
                    'Item Name': item.item_name,
                    'Opening': item.opening,
                    'Total In': item.qty_in,
                    'Total Out': item.qty_out,
                    'Closing': item.closing,
                    'Unit': item.unit
                }
            } else {
                return {
                    'Item Name': item.name,
                    'Quantity': item.quantity,
                    'Price': item.price,
                    'Total': item.total
                }
            }
        }))

        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')
        XLSX.writeFile(workbook, `${fileName}.xlsx`)
    }

    const exportPDF = (data, columns, title, period, orientation = 'p') => {
        const doc = new jsPDF({ orientation: orientation, unit: 'mm', format: 'a4' })

        // Brand Header
        doc.setFontSize(20)
        doc.setTextColor(15, 15, 15) // Brand Dark
        doc.text(title.toUpperCase(), 14, 22)

        doc.setFontSize(9)
        doc.setTextColor(150)
        doc.text(`PERIOD: ${period.start} - ${period.end}`, 14, 30)

        // Data Mapping
        const body = data.map(row => columns.map((col) => {
            const val = row[col.accessorKey || col.key]
            // Currency Formatting for specific columns
            if (col.header.toLowerCase().includes('total') || col.header.toLowerCase().includes('price')) {
                return `Rp ${new Intl.NumberFormat('id-ID').format(val || 0)}`
            }
            return val
        }))

        doc.autoTable({
            startY: 35,
            head: [columns.map(c => c.header || c.label)],
            body: body,
            theme: 'grid',
            headStyles: { fillColor: brandColor, textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 2 },
            // Conditional styling for Red Revenue in Cancellation Report
            didParseCell: (data) => {
                if (data.column.title === 'Lost Revenue') {
                    data.cell.styles.textColor = [225, 29, 72] // Rose 600
                }
            }
        })

        doc.save(`${title.replace(/\s+/g, '_')}.pdf`)
    }

    return { exportExcel, exportPDF }
}
