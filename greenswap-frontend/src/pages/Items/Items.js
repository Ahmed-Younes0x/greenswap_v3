import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";
import { api } from "../../services/api";

const Items = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    condition: searchParams.get("condition") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    location: searchParams.get("location") || "",
    ordering: searchParams.get("ordering") || "-created_at",
  });
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get("page")) || 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    count: 0,
  });
  const { showError } = useNotification();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
    updateURL();
  }, [filters, pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/items/categories/");
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      params.append("page", pagination.page);

      const response = await api.get(`/items/?${params}`);

      const fetchedItems = response.data.results || response.data;
      console.log("Fetched items:", fetchedItems);
      setItems(fetchedItems);

      if (response.data.pagination) {
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.pagination.num_pages,
          hasNext: response.data.pagination.has_next,
          hasPrevious: response.data.pagination.has_previous,
          count: response.data.pagination.count,
        }));
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      showError("فشل في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (pagination.page > 1) params.set("page", pagination.page);
    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      condition: "",
      min_price: "",
      max_price: "",
      location: "",
      ordering: "-created_at",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const conditionOptions = [
    { value: "new", label: "جديد" },
    { value: "like_new", label: "شبه جديد" },
    { value: "good", label: "جيد" },
    { value: "fair", label: "مقبول" },
    { value: "poor", label: "سيء" },
  ];

  const sortOptions = [
    { value: "-created_at", label: "الأحدث" },
    { value: "created_at", label: "الأقدم" },
    { value: "price", label: "السعر: من الأقل للأعلى" },
    { value: "-price", label: "السعر: من الأعلى للأقل" },
    { value: "-views_count", label: "الأكثر مشاهدة" },
    { value: "-likes_count", label: "الأكثر إعجاباً" },
  ];

  const getConditionBadge = (condition) => {
    const conditionConfig = {
      new: { class: "bg-success", text: "جديد" },
      like_new: { class: "bg-info", text: "شبه جديد" },
      good: { class: "bg-primary", text: "جيد" },
      fair: { class: "bg-warning", text: "مقبول" },
      poor: { class: "bg-secondary", text: "سيء" },
    };
    const config = conditionConfig[condition] || conditionConfig.good;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  return (
    <div className="container py-5 page-container">
      <div className="row">
        {/* Sidebar Filters */}
        <div className="col-lg-3 mb-4">
          <div
            className="card glass-card border-0 sticky-top"
            style={{ top: "100px" }}
          >
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-funnel me-2"></i>
                فلترة المنتجات
              </h5>
            </div>
            <div className="card-body">
              {/* Search */}
              <div className="mb-3">
                <label className="form-label fw-bold">البحث</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ابحث عن منتج..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                  />
                  <button className="btn btn-outline-secondary" type="button">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="mb-3">
                <label className="form-label fw-bold">الفئة</label>
                <select
                  className="form-select"
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                >
                  <option value="">جميع الفئات</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.items_count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div className="mb-3">
                <label className="form-label fw-bold">الحالة</label>
                <select
                  className="form-select"
                  value={filters.condition}
                  onChange={(e) =>
                    handleFilterChange("condition", e.target.value)
                  }
                >
                  <option value="">جميع الحالات</option>
                  {conditionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-3">
                <label className="form-label fw-bold">نطاق السعر (جنيه)</label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="من"
                      value={filters.min_price}
                      onChange={(e) =>
                        handleFilterChange("min_price", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="إلى"
                      value={filters.max_price}
                      onChange={(e) =>
                        handleFilterChange("max_price", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mb-3">
                <label className="form-label fw-bold">الموقع</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="المدينة أو المنطقة"
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                />
              </div>

              {/* Clear Filters */}
              <button
                className="btn btn-outline-secondary w-100"
                onClick={clearFilters}
              >
                <i className="bi bi-x-circle me-2"></i>
                مسح الفلاتر
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-2">المنتجات المتاحة</h2>
              <p className="text-muted mb-0">
                {pagination.count > 0 &&
                  `عرض ${items.length} من أصل ${pagination.count} منتج`}
              </p>
            </div>

            <div className="d-flex gap-2 align-items-center">
              <select
                className="form-select"
                style={{ width: "200px" }}
                value={filters.ordering}
                onChange={(e) => handleFilterChange("ordering", e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <Link to="/add-item" className="btn btn-primary">
                <i className="bi bi-plus-lg me-2"></i>
                إضافة منتج
              </Link>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.search ||
            filters.category ||
            filters.condition ||
            filters.min_price ||
            filters.max_price ||
            filters.location) && (
            <div className="mb-4">
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="text-muted small">الفلاتر النشطة:</span>
                {filters.search && (
                  <span className="badge bg-primary">
                    البحث: {filters.search}
                    <button
                      className="btn-close btn-close-white ms-2"
                      style={{ fontSize: "0.6rem" }}
                      onClick={() => handleFilterChange("search", "")}
                    ></button>
                  </span>
                )}
                {filters.category && (
                  <span className="badge bg-info">
                    الفئة:{" "}
                    {categories.find((c) => c.id == filters.category)?.name}
                    <button
                      className="btn-close btn-close-white ms-2"
                      style={{ fontSize: "0.6rem" }}
                      onClick={() => handleFilterChange("category", "")}
                    ></button>
                  </span>
                )}
                {filters.condition && (
                  <span className="badge bg-success">
                    الحالة:{" "}
                    {
                      conditionOptions.find(
                        (c) => c.value === filters.condition
                      )?.label
                    }
                    <button
                      className="btn-close btn-close-white ms-2"
                      style={{ fontSize: "0.6rem" }}
                      onClick={() => handleFilterChange("condition", "")}
                    ></button>
                  </span>
                )}
                {(filters.min_price || filters.max_price) && (
                  <span className="badge bg-warning">
                    السعر: {filters.min_price || "0"} -{" "}
                    {filters.max_price || "∞"}
                    <button
                      className="btn-close btn-close-white ms-2"
                      style={{ fontSize: "0.6rem" }}
                      onClick={() => {
                        handleFilterChange("min_price", "");
                        handleFilterChange("max_price", "");
                      }}
                    ></button>
                  </span>
                )}
                {filters.location && (
                  <span className="badge bg-secondary">
                    الموقع: {filters.location}
                    <button
                      className="btn-close btn-close-white ms-2"
                      style={{ fontSize: "0.6rem" }}
                      onClick={() => handleFilterChange("location", "")}
                    ></button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="text-center py-5 glass-card">
              <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: "3rem", height: "3rem" }}
              >
                <span className="visually-hidden">جاري التحميل...</span>
              </div>
              <p className="mt-3 text-muted">جاري تحميل المنتجات...</p>
            </div>
          ) : (
            <>
              {/* Items Grid */}
              {items.length > 0 ? (
                <div className="row g-4">
                  {items.map((item) => (
                    <div key={item.id} className="col-lg-4 col-md-6">
                      <div className="product-card glass-card hover-lift-lg">
                        <div className="position-relative">
                          <img
                            src={
                              item.image ||
                              "http://localhost:8000/media/items/placeholder.png"
                            }
                            alt={item.title}
                            className="product-image"
                            loading="lazy"
                          />
                          <div className="position-absolute top-0 start-0 m-2">
                            {item.is_featured && (
                              <span className="badge bg-warning me-1">
                                <i className="bi bi-star-fill me-1"></i>
                                مميز
                              </span>
                            )}
                            {item.is_urgent && (
                              <span className="badge bg-danger">
                                <i className="bi bi-clock-fill me-1"></i>
                                عاجل
                              </span>
                            )}
                          </div>
                          <div className="position-absolute top-0 end-0 m-2">
                            {getConditionBadge(item.condition)}
                          </div>
                        </div>

                        <div className="card-body">
                          <h6
                            className="card-title fw-bold mb-2"
                            style={{ height: "48px", overflow: "hidden" }}
                          >
                            {item.title}
                          </h6>
                          <p
                            className="card-text text-muted small mb-3"
                            style={{ height: "60px", overflow: "hidden" }}
                          >
                            {item.description.substring(0, 100)}...
                          </p>

                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                              <span className="fw-bold text-primary fs-5">
                                {parseFloat(item.price).toLocaleString("ar-EG")}{" "}
                                جنيه
                              </span>
                              {item.is_negotiable && (
                                <small className="text-muted d-block">
                                  قابل للتفاوض
                                </small>
                              )}
                            </div>
                            <div className="text-end">
                              <div className="d-flex align-items-center text-muted small mb-1">
                                <i className="bi bi-eye me-1"></i>
                                {item.views_count}
                                <i className="bi bi-heart me-1 ms-2"></i>
                                {item.likes_count}
                              </div>
                              <div className="text-muted small">
                                الكمية: {item.quantity}
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <span className="badge bg-secondary me-2">
                              {item.category_name}
                            </span>
                          </div>

                          <div className="d-flex align-items-center text-muted small mb-2">
                            <i className="bi bi-geo-alt me-1"></i>
                            {item.location}
                          </div>

                          <div className="d-flex align-items-center text-muted small mb-3">
                            <img
                              src={
                                item.owner.avatar_url ||
                                "http://localhost:8000/media/avatar/placeholder.png"
                              }
                              alt={item.owner.full_name}
                              className="rounded-circle me-2"
                              width="20"
                              height="20"
                            />
                            {item.owner.full_name}
                            {item.owner.is_verified && (
                              <i
                                className="bi bi-patch-check-fill text-primary ms-1"
                                title="حساب موثق"
                              ></i>
                            )}
                          </div>
                        </div>

                        <div className="card-footer bg-transparent border-0 pt-0">
                          <Link
                            to={`/items/${item.id}`}
                            className="btn btn-primary w-100"
                          >
                            <i className="bi bi-eye me-2"></i>
                            عرض التفاصيل
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i
                    className="bi bi-search text-muted"
                    style={{ fontSize: "4rem" }}
                  ></i>
                  <h4 className="mt-3 text-muted">لا توجد منتجات</h4>
                  <p className="text-muted">
                    جرب تغيير معايير البحث أو الفلترة
                  </p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={clearFilters}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    مسح الفلاتر
                  </button>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav className="mt-5">
                  <ul className="pagination justify-content-center">
                    <li
                      className={`page-item ${
                        !pagination.hasPrevious ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrevious}
                      >
                        <i className="bi bi-chevron-right me-1"></i>
                        السابق
                      </button>
                    </li>

                    {[...Array(pagination.totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      const isCurrentPage = pageNum === pagination.page;

                      // Show only 5 pages around current page
                      if (
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        (pageNum >= pagination.page - 2 &&
                          pageNum <= pagination.page + 2)
                      ) {
                        return (
                          <li
                            key={pageNum}
                            className={`page-item ${
                              isCurrentPage ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      } else if (
                        pageNum === pagination.page - 3 ||
                        pageNum === pagination.page + 3
                      ) {
                        return (
                          <li key={pageNum} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        );
                      }
                      return null;
                    })}

                    <li
                      className={`page-item ${
                        !pagination.hasNext ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                      >
                        التالي
                        <i className="bi bi-chevron-left ms-1"></i>
                      </button>
                    </li>
                  </ul>

                  <div className="text-center mt-3">
                    <small className="text-muted">
                      صفحة {pagination.page} من {pagination.totalPages}(
                      {pagination.count} منتج إجمالي)
                    </small>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Items;
