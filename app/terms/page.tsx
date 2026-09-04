import Link from "next/link";

export const metadata = { title: "ข้อกำหนดการใช้งาน · MoneyFlow" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-mf-bg">
      <div className="max-w-2xl mx-auto px-5 py-10 sm:py-14">
        <Link href="/" className="text-sm text-mf-primary font-medium">← กลับหน้าหลัก</Link>

        <div className="mt-6 flex items-center gap-2">
          <img src="/logo.png" alt="MoneyFlow" className="w-9 h-9 rounded-xl object-cover" />
          <p className="font-bold">MoneyFlow</p>
        </div>

        <h1 className="text-2xl font-bold mt-6 mb-1">ข้อกำหนดการใช้งาน</h1>
        <p className="text-sm text-mf-sub mb-8">ปรับปรุงล่าสุด: กันยายน 2569</p>

        <div className="space-y-7 text-sm leading-relaxed text-mf-text">
          <section>
            <h2 className="font-semibold text-base mb-2">1. การยอมรับข้อกำหนด</h2>
            <p>
              การสมัครใช้งานหรือเข้าใช้บริการ MoneyFlow ถือว่าคุณได้อ่านและยอมรับข้อกำหนด
              การใช้งานฉบับนี้ รวมถึงนโยบายความเป็นส่วนตัวของเรา
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">2. คำอธิบายบริการ</h2>
            <p>
              MoneyFlow เป็นเครื่องมือช่วยบันทึกและติดตามรายรับ-รายจ่าย หนี้สิน
              และค่าใช้จ่ายประจำส่วนบุคคล <b>MoneyFlow ไม่ใช่สถาบันการเงิน ไม่ใช่ที่ปรึกษาทางการเงิน
              และไม่มีใบอนุญาตประกอบธุรกิจทางการเงินใดๆ</b> ข้อมูลสรุปหรือคำแนะนำที่แสดงในแอป
              เป็นการคำนวณจากข้อมูลที่คุณกรอกเองเท่านั้น ไม่ถือเป็นคำแนะนำทางการเงิน การลงทุน
              หรือภาษี
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">3. บัญชีผู้ใช้</h2>
            <p>
              คุณมีหน้าที่รักษาความปลอดภัยของบัญชีและรหัสผ่านของตัวเอง และรับผิดชอบต่อกิจกรรม
              ทั้งหมดที่เกิดขึ้นภายใต้บัญชีของคุณ กรุณาให้ข้อมูลที่ถูกต้องตามความเป็นจริงในการสมัครใช้งาน
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">4. ความถูกต้องของข้อมูล</h2>
            <p>
              ข้อมูลการเงินทั้งหมดในระบบมาจากการกรอกของผู้ใช้เอง (ผ่านเว็บหรือ LINE)
              เราไม่รับประกันความถูกต้องหรือครบถ้วนของข้อมูลที่คุณป้อน คุณมีหน้าที่ตรวจสอบ
              ความถูกต้องของรายการต่างๆ ด้วยตัวเอง
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">5. การใช้งานที่ยอมรับได้</h2>
            <p>ห้ามใช้บริการนี้เพื่อวัตถุประสงค์ที่ผิดกฎหมาย หรือพยายามเข้าถึงข้อมูลของผู้ใช้อื่นโดยไม่ได้รับอนุญาต</p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">6. ข้อจำกัดความรับผิด</h2>
            <p>
              บริการนี้ให้บริการ "ตามสภาพที่เป็นอยู่" (as-is) โดยไม่มีการรับประกันใดๆ
              ทั้งโดยชัดแจ้งหรือโดยนัย เราไม่รับผิดชอบต่อความเสียหายที่เกิดจากการตัดสินใจ
              ทางการเงินที่อ้างอิงจากข้อมูลในแอปพลิเคชันนี้ รวมถึงความเสียหายที่เกิดจาก
              ระบบขัดข้อง ข้อมูลสูญหาย หรือการหยุดให้บริการชั่วคราว
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">7. การระงับหรือยกเลิกบัญชี</h2>
            <p>
              คุณสามารถหยุดใช้งานและขอให้ลบบัญชีได้ตลอดเวลา เราขอสงวนสิทธิ์ระงับบัญชี
              ที่ใช้งานในลักษณะละเมิดข้อกำหนดนี้
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">8. การเปลี่ยนแปลงบริการ</h2>
            <p>เราอาจปรับปรุง เพิ่ม หรือยกเลิกฟีเจอร์บางส่วนของบริการได้โดยไม่ต้องแจ้งล่วงหน้า เนื่องจากอยู่ระหว่างการพัฒนา</p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">9. กฎหมายที่ใช้บังคับ</h2>
            <p>ข้อกำหนดนี้อยู่ภายใต้บังคับของกฎหมายไทย</p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">10. ติดต่อเรา</h2>
            <p>หากมีข้อสงสัยเกี่ยวกับข้อกำหนดการใช้งานนี้ สามารถติดต่อผู้ดูแลระบบ MoneyFlow ได้โดยตรง</p>
          </section>
        </div>
      </div>
    </div>
  );
}
