const ApiError = require("../api-errors");
const ContactService = require("../services/contact.service");
const MongoDB = require("../utils/mongodb.util");

// exports.create = (req, res) => {
//     res.send({message: "create handler"});
// };

// exports.findAll = (req, res) => {
//     res.send({message: "findAll handler"});
// };

// exports.findOne = (req, res) => {
//     res.send({message: "findOne handler"});
// };

// exports.update = (req, res) => {
//     res.send({message: "update handler"});
// };

// exports.delete = (req, res) => {
//     res.send({message: "delete handler"});
// };

// exports.deleteAll = (req, res) => {
//     res.send({message: "deleteAll handler"});
// };

// exports.findAllFavorite = (req, res) => {
//     res.send({message: "findAllFavorite handler"});
// };

exports.create = async (req, res, next) => {
    // Kiểm tra xem trường name có tồn tại trong body không
    if (!req.body?.name) {
        return next(new ApiError(400, "Name cannot be empty")); // Sửa thông báo lỗi
    }

    try {
        const contactService = new ContactService(MongoDB.client); // Tạo instance của ContactService
        const document = await contactService.create(req.body); // Thêm contact mới vào database

        // Kiểm tra xem document có được thêm thành công không
        if (!document || Object.keys(document).length === 0) {
            return next(new ApiError(500, "Failed to create the contact")); // Xử lý trường hợp không thêm được
        }

        return res.status(201).send(document); // Trả về document và mã trạng thái 201 (Created)
    } catch (error) {
        console.error("Error creating contact:", error); // Ghi lại thông báo lỗi
        return next(new ApiError(500, "An error occurred while creating the contact"));
    }
};


exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const contactService = new ContactService(MongoDB.client);
        const { name } = req.query;

        if (name) {
            documents = await contactService.findByName(name);
        } else {
            documents = await contactService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving contacts")
        );
    }

    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const contactService = new ContactService(MongoDB.client);
        const document = await contactService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Contact not found"));
        }
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving contact with id=${req.params.id}`
            )
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length == 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try {
        const contactService = new ContactService(MongoDB.client);
        const document = await contactService.update(req.params.id, req.body);
        // Kiểm tra nếu không tìm thấy tài liệu
        if (!document) {
            return next(new ApiError(404, "Contact not found"));
        }
        // Trả về phản hồi thành công nếu cập nhật thành công
        return res.send({ message: "Contact was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating contact with id=${req.params.id}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const contactService = new contactService(MongoDB.client);
        const document = await contactService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Contact not found"));
        }
        return res.send({ message: "Contact was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete contact with id=${req.params.id}`)
        );
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const contactService = new ContactService(MongoDB.client);
        const deletedCount = await contactService.deleteAll();

        return res.send({ message: `${deletedCount} contacts were deleted successfully` });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all contacts")
        );
    }
};

exports.findAllFavorite = async (_req, res, next) => {
    try {
        const contactService = new ContactService(MongoDB.client);
        const documents = await contactService.findAllFavorite();
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(
                500, "An error occurred while retrieving favorite contacts"
            )
        );
    }
};