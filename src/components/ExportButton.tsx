import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { CalcResult, Inputs } from '../types';
import { fmtAmd0, fmtUsd2, fmtNum2, fmtNum4, fmtPct, fmtAmdPerL } from '../format';
import { Download } from 'lucide-react';
import { useState } from 'react';

// Sicosa Energy logo as base64 (place your actual base64 logo here)
// This is a placeholder - will be replaced with actual logo
const LOGO_URL = '/sicosa-logo.png';

interface ExportButtonProps {
    result: CalcResult;
    inputs: Inputs;
}

export function ExportButton({ result, inputs }: ExportButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        const r = result;
        const toUsd = (amd: number) => amd / r.rate;

        // Create hidden HTML element for rendering
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            left: -9999px;
            top: 0;
            width: 595px;
            min-height: 842px;
            background: white;
            padding: 40px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1a1a2e;
            font-size: 14px;
            line-height: 1.6;
        `;

        container.innerHTML = `
            <!-- Watermark background -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.08; pointer-events: none; z-index: 0;">
                <img src="${LOGO_URL}" style="width: 400px; height: auto;" crossorigin="anonymous" />
            </div>

            <!-- Content -->
            <div style="position: relative; z-index: 1;">
                <h1 style="font-size: 22px; margin-bottom: 8px; color: #1a1a2e; font-weight: 700;">Калькулятор маржинальности топлива</h1>
                <p style="color: #666; font-size: 12px; margin-bottom: 24px;">
                    Дата: ${new Date().toLocaleDateString('ru-RU')} &nbsp;|&nbsp; Тип топлива: ${r.fuelName}
                </p>
                
                <div style="background: ${r.netProfitAmd >= 0 ? '#dcfce7' : '#fee2e2'}; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                    <span style="font-size: 20px; font-weight: 700; color: ${r.netProfitAmd >= 0 ? '#166534' : '#dc2626'};">
                        Чистая прибыль: ${fmtAmd0(r.netProfitAmd)} AMD
                    </span>
                    <span style="font-size: 14px; color: ${r.netProfitAmd >= 0 ? '#166534' : '#dc2626'}; margin-left: 8px;">
                        (≈ ${fmtUsd2(toUsd(r.netProfitAmd))})
                    </span>
                </div>

                <h2 style="font-size: 15px; font-weight: 600; margin: 20px 0 12px; border-bottom: 2px solid #e5e5e5; padding-bottom: 8px;">📊 Входные данные</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Цена закупки</td><td style="text-align: right; font-weight: 500;">${inputs.purchaseUsd} $/т</td><td style="text-align: right; color: #666;">${fmtAmd0(r.purchaseAmd)} AMD</td></tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Доставка</td><td style="text-align: right; font-weight: 500;">${inputs.deliveryUsd} $/т</td><td style="text-align: right; color: #666;">${fmtAmd0(r.deliveryAmd)} AMD</td></tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Пошлина</td><td style="text-align: right; font-weight: 500;">${inputs.customsDutyUsd} $/т</td><td style="text-align: right; color: #666;">${fmtAmd0(r.customsDutyAmd)} AMD</td></tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Цена продажи</td><td style="text-align: right; font-weight: 500;">${inputs.sellAmdPerL} AMD/л</td><td></td></tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Тоннаж машины</td><td style="text-align: right; font-weight: 500;">${inputs.truckTons} т</td><td style="text-align: right; color: #666;">${fmtNum2(r.totalLiters)} л</td></tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Курс доллара</td><td style="text-align: right; font-weight: 500;">${fmtNum2(inputs.usdRate)} AMD/$</td><td></td></tr>
                    <tr><td style="padding: 8px 0;">Плотность</td><td style="text-align: right; font-weight: 500;">${fmtNum4(inputs.density)} кг/л</td><td></td></tr>
                </table>

                <h2 style="font-size: 15px; font-weight: 600; margin: 20px 0 12px; border-bottom: 2px solid #e5e5e5; padding-bottom: 8px;">💰 Налоги и сборы</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Акциз</td><td style="text-align: right; font-weight: 500;">${fmtAmd0(r.exciseAmd)} AMD/т</td></tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Экологический налог (2%)</td><td style="text-align: right; font-weight: 500;">${fmtAmd0(r.ecoAmd)} AMD</td></tr>
                    <tr><td style="padding: 8px 0;">НДС 20%</td><td style="text-align: right; font-weight: 500;">${fmtAmd0(r.vatAmd)} AMD</td></tr>
                </table>

                <h2 style="font-size: 15px; font-weight: 600; margin: 20px 0 12px; border-bottom: 2px solid #e5e5e5; padding-bottom: 8px;">📈 Расчёт на тонну</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Литров в тонне</td><td style="text-align: right; font-weight: 500;">${fmtNum2(r.litersPerTon)}</td></tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Себестоимость литра</td><td style="text-align: right; font-weight: 500;">${fmtAmdPerL(r.costPerLAmd)}</td></tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Маржа на литр</td><td style="text-align: right; font-weight: 500;">${fmtAmdPerL(r.marginPerLAmd)}</td></tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Маржа %</td><td style="text-align: right; font-weight: 500;">${fmtPct(r.marginPct)}</td></tr>
                    <tr><td style="padding: 8px 0;">Итого затрат на тонну</td><td style="text-align: right; font-weight: 500;">${fmtAmd0(r.totalCostTonAmd)} AMD</td></tr>
                </table>

                <h2 style="font-size: 15px; font-weight: 600; margin: 20px 0 12px; border-bottom: 2px solid #e5e5e5; padding-bottom: 8px;">🚛 Расчёт на машину (${inputs.truckTons} т)</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Себестоимость всего</td><td style="text-align: right; font-weight: 500;">${fmtAmd0(r.totalCostTruckAmd)} AMD</td></tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Выручка</td><td style="text-align: right; font-weight: 500;">${fmtAmd0(r.revenueTruckAmd)} AMD</td></tr>
                    <tr style="border-bottom: 1px solid #f0f0f0;"><td style="padding: 8px 0;">Доход</td><td style="text-align: right; font-weight: 500;">${fmtAmd0(r.incomeTruckAmd)} AMD</td></tr>
                    <tr><td style="padding: 8px 0;">Безубыточная цена</td><td style="text-align: right; font-weight: 500;">${fmtAmdPerL(r.breakEvenPriceAmd)}</td></tr>
                </table>

                <p style="margin-top: 32px; font-size: 11px; color: #999; text-align: center; border-top: 1px solid #e5e5e5; padding-top: 16px;">
                    Сгенерировано: Sicosa Energy — Fuel Margin Calculator
                </p>
            </div>
        `;

        document.body.appendChild(container);

        // Wait for image to load
        const img = container.querySelector('img');
        if (img) {
            await new Promise<void>((resolve) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = () => resolve();
                    img.onerror = () => resolve(); // Continue even if logo fails to load
                }
            });
        }

        try {
            // Render HTML to canvas
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            // PDF dimensions
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            // If content fits on one page
            if (imgHeight <= pageHeight) {
                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            } else {
                // Multi-page handling
                let heightLeft = imgHeight;
                let position = 0;

                // First page
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                // Additional pages
                while (heightLeft > 0) {
                    position -= pageHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
            }

            // Save PDF
            pdf.save(`sicosa-fuel-calc-${new Date().toISOString().slice(0, 10)}.pdf`);
        } finally {
            document.body.removeChild(container);
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky/20 hover:bg-sky/30 text-sky font-medium text-sm transition-colors disabled:opacity-50"
        >
            <Download size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{loading ? 'Создание...' : 'Скачать PDF'}</span>
            <span className="sm:hidden">PDF</span>
        </button>
    );
}
