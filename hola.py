import random
import uuid
from datetime import datetime, timedelta
from faker import Faker

fake = Faker("es_ES")

# Generador de números de pasaporte de prueba
def generar_passport_number(prefix="TST-", length_digits=9):
    num = "".join(str(random.randint(0, 9)) for _ in range(length_digits))
    return f"{prefix}{num}"

# Fechas coherentes: nacimiento, emisión y vencimiento
def generar_fechas():
    edad = random.randint(18, 80)
    fecha_nacimiento = fake.date_of_birth(minimum_age=edad, maximum_age=edad)

    hoy = datetime.utcnow().date()
    dias_emision = random.randint(365, 10 * 365)
    fecha_emision = hoy - timedelta(days=dias_emision)

    dias_vigencia = random.randint(365, 10 * 365)
    fecha_vencimiento = fecha_emision + timedelta(days=dias_vigencia)

    if fecha_vencimiento <= hoy:
        fecha_vencimiento = hoy + timedelta(days=random.randint(30, 10 * 365))

    return fecha_nacimiento.isoformat(), fecha_emision.isoformat(), fecha_vencimiento.isoformat()

# Construye un pasaporte falso
def crear_pasaporte():
    nombre = fake.first_name()
    apellido = fake.last_name()
    pais = fake.country()
    passport_number = generar_passport_number()
    fecha_nacimiento, fecha_emision, fecha_vencimiento = generar_fechas()

    return {
        "id": str(uuid.uuid4()),
        "nombre": nombre,
        "apellido": apellido,
        "passport_number": passport_number,
        "pais": pais,
        "fecha_nacimiento": fecha_nacimiento,
        "fecha_emision": fecha_emision,
        "fecha_vencimiento": fecha_vencimiento,
    }

# Genera N pasaportes de prueba
def generar_pasaportes(n=10):
    return [crear_pasaporte() for _ in range(n)]

if __name__ == "__main__":
    pasaportes = generar_pasaportes(5)  # genera 5 de ejemplo
    for p in pasaportes:
        print(p)
