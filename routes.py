from flask import render_template, request, jsonify, flash, redirect, url_for
from app import app, db
from models import Member
from datetime import datetime, timedelta
import logging


@app.route('/')
def index():
    """Página principal del sistema de gestión de gimnasio"""
    return render_template('index.html')


@app.route('/api/members', methods=['GET'])
def get_members():
    """Obtiene todos los miembros del gimnasio"""
    try:
        search = request.args.get('search', '')

        if search:
            # Buscar por nombre, apellido, DNI o email
            members = Member.query.filter(
                db.or_(Member.nombre.ilike(f'%{search}%'),
                       Member.apellido.ilike(f'%{search}%'),
                       Member.dni.ilike(f'%{search}%'),
                       Member.email.ilike(f'%{search}%'))).order_by(
                           Member.fecha_registro.desc()).all()
        else:
            members = Member.query.order_by(Member.fecha_registro.desc()).all()

        return jsonify({
            'success': True,
            'members': [member.to_dict() for member in members]
        })

    except Exception as e:
        logging.error(f"Error al obtener miembros: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al obtener miembros: {str(e)}'
        }), 500


@app.route('/api/members', methods=['POST'])
def create_member():
    """Crea un nuevo miembro del gimnasio"""
    try:
        data = request.json

        # Validar que el DNI y email no existan
        existing_dni = Member.query.filter_by(dni=data['dni']).first()
        if existing_dni:
            return jsonify({
                'success': False,
                'error': 'Ya existe un miembro con este DNI'
            }), 400

        existing_email = Member.query.filter_by(email=data['email']).first()
        if existing_email:
            return jsonify({
                'success': False,
                'error': 'Ya existe un miembro con este email'
            }), 400

        # Crear nuevo miembro
        new_member = Member(nombre=data['nombre'],
                            apellido=data['apellido'],
                            dni=data['dni'],
                            email=data['email'],
                            telefono=data['telefono'],
                            fecha_nacimiento=data['fecha_nacimiento'],
                            direccion=data['direccion'],
                            tipo_membresia=data['tipo_membresia'],
                            fecha_inicio=data['fecha_inicio'],
                            fecha_vencimiento=data['fecha_vencimiento'],
                            estado=data.get('estado', 'activo'))

        db.session.add(new_member)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Miembro registrado exitosamente',
            'member': new_member.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error al crear miembro: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al crear miembro: {str(e)}'
        }), 500


@app.route('/api/members/<int:member_id>', methods=['GET'])
def get_member(member_id):
    """Obtiene un miembro específico por ID"""
    try:
        member = Member.query.get_or_404(member_id)
        return jsonify({'success': True, 'member': member.to_dict()})

    except Exception as e:
        logging.error(f"Error al obtener miembro: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al obtener miembro: {str(e)}'
        }), 500


@app.route('/api/members/<int:member_id>', methods=['PUT'])
def update_member(member_id):
    """Actualiza un miembro existente"""
    try:
        member = Member.query.get_or_404(member_id)
        data = request.json

        # Validar que el DNI y email no existan en otros miembros
        existing_dni = Member.query.filter(Member.dni == data['dni'], Member.id
                                           != member_id).first()
        if existing_dni:
            return jsonify({
                'success': False,
                'error': 'Ya existe otro miembro con este DNI'
            }), 400

        existing_email = Member.query.filter(Member.email == data['email'],
                                             Member.id != member_id).first()
        if existing_email:
            return jsonify({
                'success': False,
                'error': 'Ya existe otro miembro con este email'
            }), 400

        # Actualizar los datos del miembro
        member.nombre = data['nombre']
        member.apellido = data['apellido']
        member.dni = data['dni']
        member.email = data['email']
        member.telefono = data['telefono']
        member.fecha_nacimiento = data['fecha_nacimiento']
        member.direccion = data['direccion']
        member.tipo_membresia = data['tipo_membresia']
        member.fecha_inicio = data['fecha_inicio']
        member.fecha_vencimiento = data['fecha_vencimiento']
        member.estado = data.get('estado', member.estado)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Miembro actualizado exitosamente',
            'member': member.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error al actualizar miembro: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al actualizar miembro: {str(e)}'
        }), 500


@app.route('/api/members/<int:member_id>', methods=['DELETE'])
def delete_member(member_id):
    """Elimina un miembro del gimnasio"""
    try:
        member = Member.query.get_or_404(member_id)
        member_name = f"{member.nombre} {member.apellido}"

        db.session.delete(member)
        db.session.commit()

        return jsonify({
            'success':
            True,
            'message':
            f'Miembro {member_name} eliminado exitosamente'
        })

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error al eliminar miembro: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al eliminar miembro: {str(e)}'
        }), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Recurso no encontrado'}), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({
        'success': False,
        'error': 'Error interno del servidor'
    }), 500


from flask import render_template


@app.route('/')
def inicio():
    return render_template('index.html')
