from app import db
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Text

class Member(db.Model):
    """Modelo para miembros del gimnasio"""
    id = db.Column(Integer, primary_key=True)
    nombre = db.Column(String(100), nullable=False)
    apellido = db.Column(String(100), nullable=False)
    dni = db.Column(String(20), unique=True, nullable=False)
    email = db.Column(String(120), unique=True, nullable=False)
    telefono = db.Column(String(20), nullable=False)
    fecha_nacimiento = db.Column(String(10), nullable=False)  # Format: YYYY-MM-DD
    direccion = db.Column(Text, nullable=False)
    tipo_membresia = db.Column(String(50), nullable=False)
    fecha_inicio = db.Column(String(10), nullable=False)  # Format: YYYY-MM-DD
    fecha_vencimiento = db.Column(String(10), nullable=False)  # Format: YYYY-MM-DD
    estado = db.Column(String(20), nullable=False, default='activo')
    fecha_registro = db.Column(DateTime, nullable=False, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Member {self.nombre} {self.apellido}>'
    
    def to_dict(self):
        """Convierte el objeto Member a diccionario para JSON"""
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'dni': self.dni,
            'email': self.email,
            'telefono': self.telefono,
            'fecha_nacimiento': self.fecha_nacimiento,
            'direccion': self.direccion,
            'tipo_membresia': self.tipo_membresia,
            'fecha_inicio': self.fecha_inicio,
            'fecha_vencimiento': self.fecha_vencimiento,
            'estado': self.estado,
            'fecha_registro': self.fecha_registro.strftime('%Y-%m-%d %H:%M:%S')
        }
