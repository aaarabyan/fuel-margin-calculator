import { jsPDF } from 'jspdf';
import type { CalcResult, Inputs } from '../types';
import { fmtAmd0, fmtUsd2, fmtNum2, fmtNum4, fmtPct, fmtAmdPerL } from '../format';
import { Download } from 'lucide-react';

interface ExportButtonProps {
    result: CalcResult;
    inputs: Inputs;
}

export function ExportButton({ result, inputs }: ExportButtonProps) {
    const handleExport = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const r = result;
        const toUsd = (amd: number) => amd / r.rate;

        // Title
        doc.setFontSize(18);
        doc.text('Калькулятор маржинальности топлива', 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 20, 28);
        doc.text(`Тип топлива: ${r.fuelName}`, 100, 28);

        // Main result
        doc.setFontSize(14);
        doc.setTextColor(r.netProfitAmd >= 0 ? 34 : 220, r.netProfitAmd >= 0 ? 139 : 38, r.netProfitAmd >= 0 ? 34 : 38);
        doc.text(`Чистая прибыль: ${fmtAmd0(r.netProfitAmd)} AMD (≈${fmtUsd2(toUsd(r.netProfitAmd))})`, 20, 40);

        let y = 55;
        doc.setTextColor(0);
        doc.setFontSize(12);

        // Input data section
        doc.text('Входные данные', 20, y);
        y += 8;
        doc.setFontSize(10);

        const inputData = [
            ['Цена закупки', `${inputs.purchaseUsd} $/т`, fmtAmd0(r.purchaseAmd) + ' AMD'],
            ['Доставка', `${inputs.deliveryUsd} $/т`, fmtAmd0(r.deliveryAmd) + ' AMD'],
            ['Пошлина', `${inputs.customsDutyUsd} $/т`, fmtAmd0(r.customsDutyAmd) + ' AMD'],
            ['Цена продажи', `${inputs.sellAmdPerL} AMD/л`, ''],
            ['Тоннаж машины', `${inputs.truckTons} т`, `${fmtNum2(r.totalLiters)} л`],
            ['Курс доллара', `${fmtNum2(inputs.usdRate)} AMD/$`, ''],
            ['Плотность', `${fmtNum4(inputs.density)} кг/л`, ''],
        ];

        inputData.forEach(row => {
            doc.text(row[0], 25, y);
            doc.text(row[1], 80, y);
            if (row[2]) doc.text(row[2], 130, y);
            y += 6;
        });

        y += 5;
        doc.setFontSize(12);
        doc.text('Налоги и сборы', 20, y);
        y += 8;
        doc.setFontSize(10);

        const taxData = [
            ['Акциз', fmtAmd0(r.exciseAmd) + ' AMD/т'],
            ['Экологический налог (2%)', fmtAmd0(r.ecoAmd) + ' AMD'],
            ['НДС 20%', fmtAmd0(r.vatAmd) + ' AMD'],
        ];

        taxData.forEach(row => {
            doc.text(row[0], 25, y);
            doc.text(row[1], 100, y);
            y += 6;
        });

        y += 5;
        doc.setFontSize(12);
        doc.text('Расчёт на тонну', 20, y);
        y += 8;
        doc.setFontSize(10);

        const perTonData = [
            ['Литров в тонне', fmtNum2(r.litersPerTon)],
            ['Себестоимость литра', fmtAmdPerL(r.costPerLAmd)],
            ['Маржа на литр', fmtAmdPerL(r.marginPerLAmd)],
            ['Маржа %', fmtPct(r.marginPct)],
            ['Итого затрат на тонну', fmtAmd0(r.totalCostTonAmd) + ' AMD'],
        ];

        perTonData.forEach(row => {
            doc.text(row[0], 25, y);
            doc.text(row[1], 100, y);
            y += 6;
        });

        y += 5;
        doc.setFontSize(12);
        doc.text('Расчёт на машину', 20, y);
        y += 8;
        doc.setFontSize(10);

        const truckData = [
            ['Себестоимость всего', fmtAmd0(r.totalCostTruckAmd) + ' AMD'],
            ['Выручка', fmtAmd0(r.revenueTruckAmd) + ' AMD'],
            ['Доход', fmtAmd0(r.incomeTruckAmd) + ' AMD'],
            ['Безубыточная цена', fmtAmdPerL(r.breakEvenPriceAmd)],
        ];

        truckData.forEach(row => {
            doc.text(row[0], 25, y);
            doc.text(row[1], 100, y);
            y += 6;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Сгенерировано: Fuel Margin Calculator', 20, 285);

        // Save
        const filename = `fuel-calc-${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(filename);
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky/20 hover:bg-sky/30 text-sky font-medium text-sm transition-colors"
        >
            <Download size={16} />
            <span className="hidden sm:inline">Скачать PDF</span>
            <span className="sm:hidden">PDF</span>
        </button>
    );
}
