const { ObjectId } = require("mongodb");

class ContactService {
    constructor(client) {
        this.Contact = client.db().collection("contacts");
    }

    extractContactData(payload) {
        const contact = {
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
            favorite: payload.favorite,
        };

        Object.keys(contact).forEach(
            (key) => contact[key] === undefined && delete contact[key]  // Sửa lỗi chính tả ở đây
        );
        return contact;
    }

    async create(payload) {
        const contact = this.extractContactData(payload);

        // Kiểm tra xem contact có dữ liệu hợp lệ không
        if (Object.keys(contact).length === 0) {
            throw new Error("Contact data is empty"); // Thêm kiểm tra nếu không có dữ liệu
        }   

        // Tìm contact theo tên, hoặc bạn có thể chọn trường khác như email, phone
        const result = await this.Contact.findOneAndUpdate(
            { name: contact.name }, // Điều kiện tìm kiếm
            { $set: { ...contact, favorite: contact.favorite === true } }, // Cập nhật dữ liệu
            { returnDocument: "after", upsert: true } // Upsert là true để thêm mới nếu không tìm thấy
        );

        return result; // Trả về document đã thêm hoặc cập nhật
    }

    async find(filter) {
        const cursor = await this.Contact.find(filter);
        return await cursor.toArray();
    }

    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },  // Sửa ở đây
        });
    }

    async findById(id) {
        return await this.Contact.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractContactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value;  // Có thể kiểm tra để đảm bảo không trả về undefined
    }

    async delete(id) {
        const result = await this.Contact.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result;
    }

    async deleteAll() {
        const result = await this.Contact.deleteMany({});
        return result.deletedCount;
    }

    async findFavorite() {
        return await this.find({ favorite: true });
    }
}

module.exports = ContactService;
